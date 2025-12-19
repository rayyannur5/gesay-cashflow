#!/bin/bash
set -e

echo "--- 🚀 STARTING SETUP ---"

# ==========================================
# BAGIAN 1: LARAVEL SETUP
# ==========================================

# 1. Setup .env
if [ ! -f ".env" ]; then
    echo "⚠️  .env tidak ditemukan. Copying .env.example..."
    cp .env.example .env
fi

# 2. Force Database Host ke Docker Host (PENTING!)
# Kita hapus baris DB_HOST lama dan ganti baru agar pasti connect
if grep -q "DB_HOST=" .env; then
    sed -i '/^DB_HOST=/d' .env
fi
echo "DB_HOST=host.docker.internal" >> .env

# 3. Generate APP_KEY (Jika kosong)
if grep -q "APP_KEY=$" .env || grep -q "APP_KEY=$" .env.example; then
    echo "🔑 Generating APP_KEY..."
    php artisan key:generate
fi

# 4. CEK & INSTALL OCTANE (Otomatis)
if ! grep -q "laravel/octane" composer.json; then
    echo "⚡ Laravel Octane belum ada. Menginstall..."
    composer require laravel/octane spiral/roadrunner-cli --ignore-platform-reqs
    
    echo "⚡ Setup Octane Config..."
    php artisan octane:install --server=frankenphp
fi

# ==========================================
# BAGIAN 2: CLOUDFLARE SETUP
# ==========================================

CF_DIR="/etc/cloudflared"
mkdir -p $CF_DIR

# 1. Cek Login
if [ ! -f "$CF_DIR/cert.pem" ]; then
    echo "⚠️  BELUM LOGIN CLOUDFLARE. Cek logs untuk URL Login."
    cloudflared tunnel login
    # Copy cert ke lokasi default config
    cp /root/.cloudflared/cert.pem $CF_DIR/ 2>/dev/null || true
fi

# 2. Setup Tunnel & Config
if [ ! -f "$CF_DIR/config.yml" ]; then
    echo "⚙️  Setup Tunnel: $TUNNEL_NAME"
    
    EXISTING_JSON=$(find /root/.cloudflared -name "*.json" | head -n 1)
    if [ -z "$EXISTING_JSON" ]; then
        cloudflared tunnel create $TUNNEL_NAME
        EXISTING_JSON=$(find /root/.cloudflared -name "*.json" | head -n 1)
    fi
    cp "$EXISTING_JSON" "$CF_DIR/"
    UUID=$(basename "$EXISTING_JSON" .json)
    
    echo "🔗 Routing DNS..."
    cloudflared tunnel route dns $UUID $APP_DOMAIN
    
    echo "📝 Writing Config..."
    # PERBAIKAN: Ingres ke localhost:8000 (Port Octane)
    cat > $CF_DIR/config.yml <<EOF
tunnel: "$UUID"
credentials-file: $CF_DIR/$UUID.json
ingress:
  - hostname: $APP_DOMAIN
    service: http://localhost:8000
  - service: http_status:404
EOF
fi

# ==========================================
# BAGIAN 3: STARTUP
# ==========================================

echo "🚀 Menyalakan Cloudflare Tunnel..."
# PERBAIKAN: Jalankan tanpa flag --config (Dia otomatis baca /etc/cloudflared/config.yml)
cloudflared tunnel run &

echo "🚀 Menyalakan Laravel Octane..."
# PERBAIKAN: Jalankan perintah native Octane, bukan raw frankenphp
# Kita set port 8000 agar sesuai dengan config cloudflare diatas
php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=8000