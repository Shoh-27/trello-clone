#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
until php artisan migrate:status 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is up - executing migrations"
php artisan migrate --force

# Generate app key if not exists
if [ -z "$APP_KEY" ]; then
  php artisan key:generate
fi

# Create storage link
php artisan storage:link || true

# Cache configuration
php artisan config:cache
php artisan route:cache

exec "$@"
