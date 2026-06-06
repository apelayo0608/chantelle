<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

allow_cors();
start_admin_session();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['message' => 'POST method required.'], 405);
}

$data = read_json_body();
$username = trim((string) ($data['username'] ?? ''));
$password = (string) ($data['password'] ?? '');

if ($username === ADMIN_USERNAME && hash_equals(ADMIN_PASSWORD, $password)) {
    session_regenerate_id(true);
    $_SESSION['admin_logged_in'] = true;
    $_SESSION['admin_username'] = $username;
    send_json(['message' => 'Logged in.', 'admin' => ['username' => $username]]);
}

send_json(['message' => 'Invalid admin username or password.'], 401);
