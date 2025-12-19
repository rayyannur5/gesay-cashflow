#!/bin/bash
set -e

echo "--- 🚀 STARTING PRODUCTION SETUP (SMART FIX) ---"

# ==========================================
# BAGIAN 1: LARAVEL SETUP
# ==========================================

if [ ! -f ".env" ]; then
    echo "⚠️  .env tidak ditemukan. Copying .env.example..."
    cp .env.example .env
fi

# Force DB Host
sed -i '/^DB_HOST=/d' .env
echo "DB_HOST=host.docker.internal" >> .env

# Generate Key (Force)
if grep -q "APP_KEY=$" .env || grep -q "APP_KEY=$" .env.example; then
    echo "🔑 Generating APP_KEY..."
    php artisan key:generate --force
fi

# Install Octane
if ! grep -q "laravel/octane" composer.json; then
    echo "⚡ Installing Octane..."
    composer require laravel/octane spiral/roadrunner-cli --ignore-platform-reqs --no-interaction
    php artisan octane:install --server=frankenphp --force
fi

# ==========================================
# BAGIAN 2: CLOUDFLARE SETUP
# ==========================================

CF_DIR="/etc/cloudflared"
mkdir -p $CF_DIR
mkdir -p /root/.cloudflared # Fix error "No such file"

# 1. Cek Login & Copy Cert
if [ ! -f "$CF_DIR/cert.pem" ]; then
    echo "⚠️  BELUM LOGIN CLOUDFLARE. Cek logs untuk URL Login."
    cloudflared tunnel login
    cp /root/.cloudflared/cert.pem $CF_DIR/ 2>/dev/null || true
else
    # Jika cert ada di volume, copy balik ke root agar command 'cloudflared' jalan
    cp $CF_DIR/cert.pem /root/.cloudflared/cert.pem 2>/dev/null || true
fi

# 2. Logic Smart Tunnel Creation
# Cek apakah kita sudah punya kredensial yang valid di volume?
EXISTING_JSON=$(find $CF_DIR -name "*.json" | head -n 1)

if [ -n "$EXISTING_JSON" ]; then
    echo "✅ Kredensial Tunnel ditemukan: $EXISTING_JSON"
    UUID=$(basename "$EXISTING_JSON" .json)
else
    echo "⚙️  Kredensial tidak ditemukan. Mencoba membuat tunnel baru: $TUNNEL_NAME"
    
    # Coba buat tunnel. Jika gagal (karena nama sudah ada), hapus dulu lalu buat lagi.
    if ! cloudflared tunnel create $TUNNEL_NAME; then
        echo "⚠️  Tunnel '$TUNNEL_NAME' sudah ada tapi kuncinya hilang."
        echo "♻️  Menghapus tunnel lama dan membuat ulang..."
        
        # Hapus tunnel lama (butuh cert.pem)
        cloudflared tunnel delete -f $TUNNEL_NAME || true
        
        # Buat lagi yang baru
        cloudflared tunnel create $TUNNEL_NAME
    fi
    
    # Ambil JSON yang baru dibuat dari folder root
    NEW_JSON=$(find /root/.cloudflared -name "*.json" | head -n 1)
    
    # Simpan ke volume persistent agar besok tidak hilang lagi
    cp "$NEW_JSON" "$CF_DIR/"
    UUID=$(basename "$NEW_JSON" .json)
fi

# 3. FORCE UPDATE CONFIG
echo "📝 Updating Cloudflare Config..."

# Pastikan DNS routing benar
cloudflared tunnel route dns $UUID $APP_DOMAIN

cat > $CF_DIR/config.yml <<EOF
tunnel: "$UUID"
credentials-file: $CF_DIR/$UUID.json
ingress:
  - hostname: $APP_DOMAIN
    service: http://localhost:8000
  - service: http_status:404
EOF

# ==========================================
# BAGIAN 3: STARTUP
# ==========================================

echo "🚀 Menyalakan Cloudflare Tunnel..."
cloudflared tunnel run &

echo "🚀 Menyalakan Laravel Octane..."
php artisan octane:start --server=frankenphp \
    --host=0.0.0.0 \
    --port=8000 \
    --workers=2 \
    --max-requests=500 \
    --no-interaction