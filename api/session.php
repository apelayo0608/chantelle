<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

allow_cors();
start_admin_session();

$authenticated = !empty($_SESSION['admin_logged_in']) || has_valid_admin_token();

send_json([
    'authenticated' => $authenticated,
    'admin' => $authenticated ? ['username' => $_SESSION['admin_username'] ?? ADMIN_USERNAME] : null,
]);
