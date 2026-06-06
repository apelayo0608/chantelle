<?php
declare(strict_types=1);

const DB_HOST = 'fitoncloud.online';
const DB_PORT = '3306';
const DB_NAME = 'chantelle';
const DB_USER = 'chantelle';
const DB_PASS = '++HROGQhykL2e~Yb';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Angel09234';

function send_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

function allow_cors(): void
{
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
    }

    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit;
    }
}

function start_admin_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'path' => '/',
    ]);
    session_start();
}

function require_admin(): void
{
    start_admin_session();
    if (empty($_SESSION['admin_logged_in'])) {
        send_json(['message' => 'Admin login required.'], 401);
    }
}

function root_db(): PDO
{
    $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $pdo->exec(
        'CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '`
         CHARACTER SET utf8mb4
         COLLATE utf8mb4_unicode_ci'
    );

    return $pdo;
}

function db(): PDO
{
    root_db();

    $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS guests (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            guest_name VARCHAR(180) NOT NULL,
            contact_number VARCHAR(60) NOT NULL,
            bring_count INT UNSIGNED NOT NULL DEFAULT 0,
            companions_json JSON NOT NULL,
            adult_count INT UNSIGNED NOT NULL DEFAULT 0,
            kid_count INT UNSIGNED NOT NULL DEFAULT 0,
            allergies TEXT NULL,
            confirmed TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );

    return $pdo;
}

function read_json_body(): array
{
    $rawBody = file_get_contents('php://input') ?: '';
    $data = json_decode($rawBody, true);
    return is_array($data) ? $data : [];
}

function normalize_guest_row(array $row): array
{
    $companions = json_decode($row['companions_json'] ?? '[]', true);
    if (!is_array($companions)) {
        $companions = [];
    }

    return [
        'id' => (int) $row['id'],
        'guestName' => $row['guest_name'],
        'contactNumber' => $row['contact_number'],
        'bringCount' => (int) $row['bring_count'],
        'companions' => $companions,
        'adultCount' => (int) $row['adult_count'],
        'kidCount' => (int) $row['kid_count'],
        'allergies' => $row['allergies'] ?? '',
        'confirmed' => (bool) $row['confirmed'],
        'createdAt' => $row['created_at'],
    ];
}
