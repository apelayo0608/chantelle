<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

allow_cors();
start_admin_session();

send_json([
    'authenticated' => !empty($_SESSION['admin_logged_in']),
    'admin' => !empty($_SESSION['admin_logged_in']) ? ['username' => $_SESSION['admin_username'] ?? ADMIN_USERNAME] : null,
]);
