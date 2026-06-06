# Chantelle Invitation RSVP

React Vite invitation and guest registration app with a PHP API, MySQL database, admin login, guest list, and Excel-compatible CSV export.

## Run locally

Install front-end dependencies:

```bash
npm install
```

Create/edit the MySQL settings in `api/config.php`:

```php
const DB_HOST = '127.0.0.1';
const DB_PORT = '3306';
const DB_NAME = 'chantelle_invitation';
const DB_USER = 'root';
const DB_PASS = '';
```

Set the admin login in `api/config.php` before deploying:

```php
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'change-this-password';
```

Start the PHP API:

```bash
php -S 127.0.0.1:8000
```

Start Vite in another terminal:

```bash
npm run dev
```

Open the Vite URL. The Vite proxy sends `/api/*` requests to the PHP server.

## MySQL Database

The API creates the `chantelle_invitation` database and `guests` table automatically on first request using the MySQL credentials in `api/config.php`.

You can also import `api/mysql-schema.sql` manually.

## Admin

Use the `Admin` tab to login, view guest confirmations, totals, search entries, and export an Excel-compatible CSV file.
# chantelle
