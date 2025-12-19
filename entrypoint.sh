#!/bin/bash
set -e

echo "--- 🚀 STARTING PRODUCTION SETUP ---"

# ==========================================
# BAGIAN 1: LARAVEL SETUP
# ==========================================

# 1. Setup .env
if [ ! -f ".env" ]; then
    echo "⚠️  .env tidak ditemukan. Copying .env.example..."
    cp .env.example .env
fi

# 2. Force Database Host ke Docker Host
sed -i '/^DB_HOST=/d' .env
echo "DB_HOST=host.docker.internal" >> .env

# 3. Generate APP_KEY (FIXED: Added --force)
# Kita tambah --force agar tidak minta konfirmasi Yes/No di mode production
if grep -q "APP_KEY=$" .env || grep -q "APP_KEY=$" .env.example; then
    echo "🔑 Generating APP_KEY..."
    php artisan key:generate --force
fi

# 4. CEK & INSTALL OCTANE (Otomatis)
if ! grep -q "laravel/octane" composer.json; then
    echo "⚡ Laravel Octane belum terinstall. Menginstall..."
    # Tambah --no-interaction biar composer gak nanya-nanya juga
    composer require laravel/octane spiral/roadrunner-cli --ignore-platform-reqs --no-interaction
    
    echo "⚡ Setup Octane Config..."
    php artisan octane:install --server=frankenphp --force
fi

# ==========================================
# BAGIAN 2: CLOUDFLARE SETUP
# ==========================================

CF_DIR="/etc/cloudflared"
mkdir -p $CF_DIR

# 1. Cek Login & Copy Cert
if [ ! -f "$CF_DIR/cert.pem" ]; then
    echo "⚠️  BELUM LOGIN CLOUDFLARE. Cek logs untuk URL Login."
    cloudflared tunnel login
    cp /root/.cloudflared/cert.pem $CF_DIR/ 2>/dev/null || true
fi

# 2. Pastikan Tunnel Ada
EXISTING_JSON=$(find /root/.cloudflared -name "*.json" | head -n 1)
if [ -z "$EXISTING_JSON" ]; then
    echo "⚙️  Membuat Tunnel Baru: $TUNNEL_NAME"
    cloudflared tunnel create $TUNNEL_NAME
    EXISTING_JSON=$(find /root/.cloudflared -name "*.json" | head -n 1)
fi

# Copy credentials
cp "$EXISTING_JSON" "$CF_DIR/"
UUID=$(basename "$EXISTING_JSON" .json)

# 3. FORCE UPDATE CONFIG
echo "📝 Updating Cloudflare Config (Target: localhost:8000)..."

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
# BAGIAN 3: STARTUP (PRODUCTION TUNING)
# ==========================================

echo "🚀 Menyalakan Cloudflare Tunnel..."
cloudflared tunnel run &

echo "🚀 Menyalakan Laravel Octane (Production Mode)..."

php artisan octane:start --server=frankenphp \
    --host=0.0.0.0 \
    --port=8000 \
    --workers=2 \
    --max-requests=500 \
    --no-interaction