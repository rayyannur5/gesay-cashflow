---
description: Setup dan jalankan aplikasi Cashflow untuk pertama kali
---

# Setup Aplikasi Cashflow

## Langkah 1: Konfigurasi Database MySQL
Edit file `.env` dan update konfigurasi database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=finance_db
DB_USERNAME=root
DB_PASSWORD=
```

## Langkah 2: Buat Database
Buat database `finance_db` di MySQL melalui Laragon atau phpMyAdmin.

// turbo
## Langkah 3: Jalankan Migration
```bash
php artisan migrate --seed
```

// turbo
## Langkah 4: Jalankan Dev Server
Buka 2 terminal:

Terminal 1 (Laravel):
```bash
php artisan serve
```

Terminal 2 (Vite):
```bash
npm run dev
```

## Langkah 5: Akses Aplikasi
Buka browser dan akses: http://localhost:8000

Login dengan:
- Email: admin@example.com
- Password: password
