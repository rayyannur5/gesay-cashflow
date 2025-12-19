#!/bin/bash
set -e

# --- BAGIAN 1: AUTO SETUP LARAVEL ---

# 1. Cek & Copy .env
if [ ! -f ".env" ]; then
    echo "⚠️  File .env tidak ditemukan. Copy dari .env.example..."
    cp .env.example .env
fi

# 2. Setup Database di .env (PENTING: Pakai DB Host dari Docker)
# Kita force ganti DB_HOST di .env jadi host.docker.internal biar gak error koneksi
if grep -q "DB_HOST=" .env; then
  sed -i "s/^DB_HOST=.*/DB_HOST=host.docker.internal/" .env
else
  echo "DB_HOST=host.docker.internal" >> .env
fi

# 3. Generate APP_KEY
if grep -q "APP_KEY=$" .env || grep -q "APP_KEY=$" .env.example; then
    echo "🔑 Men-generate APP_KEY..."
    php artisan key:generate
fi

# 4. INSTALL OCTANE (SOLUSI ERROR KAMU)
# Cek apakah Octane sudah ada di composer.json?
if ! grep -q "laravel/octane" composer.json; then
    echo "⚡ Laravel Octane belum terinstall. Menginstall Octane..."
    
    # Install package via composer
    composer require laravel/octane spiral/roadrunner-cli --ignore-platform-reqs
    
    # Install config octane untuk FrankenPHP
    php artisan octane:install --server=frankenphp
    
    echo "✅ Octane berhasil diinstall!"
fi

# --- BAGIAN 2: AUTO SETUP CLOUDFLARE ---

CF_DIR="/etc/cloudflared"
mkdir -p $CF_DIR

# Cek Login
if [ ! -f "$CF_DIR/cert.pem" ]; then
    echo "⚠️  BELUM LOGIN CLOUDFLARE. Cek logs untuk URL Login."
    cloudflared tunnel login
    cp /root/.cloudflared/cert.pem $CF_DIR/ 2>/dev/null || true
fi

# Cek Config Tunnel
if [ ! -f "$CF_DIR/config.yml" ]; then
    # ... (Logika tunnel sama seperti sebelumnya) ...
    echo "⚙️  Setup Tunnel: $TUNNEL_NAME"
    
    EXISTING_JSON=$(find /root/.cloudflared -name "*.json" | head -n 1)
    if [ -z "$EXISTING_JSON" ]; then
        cloudflared tunnel create $TUNNEL_NAME
        EXISTING_JSON=$(find /root/.cloudflared -name "*.json" | head -n 1)
    fi
    cp "$EXISTING_JSON" "$CF_DIR/"
    UUID=$(basename "$EXISTING_JSON" .json)
    
    cloudflared tunnel route dns $UUID $APP_DOMAIN
    
    cat > $CF_DIR/config.yml <<EOF
tunnel: "$UUID"
credentials-file: $CF_DIR/$UUID.json
ingress:
  - hostname: $APP_DOMAIN
    service: http://localhost:80
  - service: http_status:404
EOF
fi

# --- BAGIAN 3: STARTUP ---

echo "🚀 Starting Tunnel & Laravel Octane..."
cloudflared tunnel run --config $CF_DIR/config.yml &

# PENTING: Jalankan via Octane Command, bukan php-server biasa agar config terload
php artisan octane:start --server=frankenphp --host=0.0.0.0 --port=80