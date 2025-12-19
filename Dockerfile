FROM cloudflare/cloudflared:latest AS cf-source
FROM dunglas/frankenphp:php8.3

# Copy Cloudflared
COPY --from=cf-source /usr/local/bin/cloudflared /usr/local/bin/cloudflared

# Install Extensions
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && install-php-extensions pdo_mysql bcmath gd intl zip opcache pcntl

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Setup App
WORKDIR /app
COPY . .

# Install Vendor
RUN composer install --no-dev --optimize-autoloader --no-interaction

# PERMISSION PENTING:
# Kita beri izin write ke folder /app agar entrypoint bisa copy .env & generate key
RUN chown -R www-data:www-data /app && chmod -R 775 /app

# Entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]