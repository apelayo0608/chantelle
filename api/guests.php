<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

allow_cors();
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    send_json(['message' => 'GET method required.'], 405);
}

$rows = db()
    ->query('SELECT * FROM guests ORDER BY created_at DESC, id DESC')
    ->fetchAll(PDO::FETCH_ASSOC);

send_json([
    'guests' => array_map('normalize_guest_row', $rows),
]);
