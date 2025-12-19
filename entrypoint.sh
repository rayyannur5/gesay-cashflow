#!/bin/bash
set -e

# --- BAGIAN 1: AUTO SETUP .ENV & KEY ---

# Cek apakah file .env sudah ada? Kalau belum, kita buat.
if [ ! -f ".env" ]; then
    echo "⚠️  File .env tidak ditemukan."
    echo "📝 Meng-copy .env.example ke .env..."
    cp .env.example .env
    
    echo "🔑 Men-generate APP_KEY..."
    php artisan key:generate
    
    echo "✅ Setup .env selesai!"
else
    echo "✅ File .env sudah ada. Melewati setup env."
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
    echo "⚙️  Setup Tunnel: $TUNNEL_NAME"
    
    # Create Tunnel jika belum ada
    EXISTING_JSON=$(find /root/.cloudflared -name "*.json" | head -n 1)
    if [ -z "$EXISTING_JSON" ]; then
        cloudflared tunnel create $TUNNEL_NAME
        EXISTING_JSON=$(find /root/.cloudflared -name "*.json" | head -n 1)
    fi
    cp "$EXISTING_JSON" "$CF_DIR/"
    UUID=$(basename "$EXISTING_JSON" .json)
    
    # Route DNS
    cloudflared tunnel route dns $UUID $APP_DOMAIN
    
    # Bikin Config
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

echo "🚀 Starting Tunnel & Laravel..."
cloudflared tunnel run --config $CF_DIR/config.yml &
exec frankenphp php-server --worker public/index.php