<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

allow_cors();
require_admin();

$rows = db()
    ->query('SELECT * FROM guests ORDER BY created_at DESC, id DESC')
    ->fetchAll(PDO::FETCH_ASSOC);

$fileName = 'chantelle-guest-list-' . date('Y-m-d') . '.csv';

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="' . $fileName . '"');

$output = fopen('php://output', 'w');
fputcsv($output, [
    'ID',
    'Guest Name',
    'Contact Number',
    'Confirmation',
    'Guests Bringing',
    'Adults',
    'Kids',
    'Companion Names',
    'Allergies / Food Notes',
    'Submitted At',
]);

foreach ($rows as $row) {
    $guest = normalize_guest_row($row);
    $companions = array_map(static function (array $companion): string {
        return trim(($companion['name'] ?? '') . ' (' . ($companion['type'] ?? 'adult') . ')');
    }, $guest['companions']);

    fputcsv($output, [
        $guest['id'],
        $guest['guestName'],
        $guest['contactNumber'],
        $guest['confirmed'] ? 'Confirmed' : 'Declined',
        $guest['bringCount'],
        $guest['adultCount'],
        $guest['kidCount'],
        implode(', ', array_filter($companions)),
        $guest['allergies'],
        $guest['createdAt'],
    ]);
}

fclose($output);
