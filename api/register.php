<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

allow_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['message' => 'POST method required.'], 405);
}

$data = read_json_body();
$guestName = trim((string) ($data['guestName'] ?? ''));
$contactNumber = trim((string) ($data['contactNumber'] ?? ''));
$bringCount = max(0, min(20, (int) ($data['bringCount'] ?? 0)));
$companions = $data['companions'] ?? [];
$adultCount = max(0, (int) ($data['adultCount'] ?? 0));
$kidCount = max(0, (int) ($data['kidCount'] ?? 0));
$allergies = trim((string) ($data['allergies'] ?? ''));
$carPlateNumber = trim((string) ($data['carPlateNumber'] ?? ''));
$confirmed = !empty($data['confirmed']) ? 1 : 0;

if ($confirmed === 0) {
    $bringCount = 0;
    $companions = [];
    $adultCount = 0;
    $kidCount = 0;
}

if ($guestName === '' || $contactNumber === '') {
    send_json(['message' => 'Guest name and contact number are required.'], 422);
}

if (!is_array($companions)) {
    $companions = [];
}

$cleanCompanions = array_values(array_map(static function (array $companion): array {
    $type = ($companion['type'] ?? 'adult') === 'kid' ? 'kid' : 'adult';
    return [
        'name' => trim((string) ($companion['name'] ?? '')),
        'type' => $type,
    ];
}, array_filter($companions, 'is_array')));

$pdo = db();
$statement = $pdo->prepare(
    'INSERT INTO guests (
        guest_name,
        contact_number,
        bring_count,
        companions_json,
        adult_count,
        kid_count,
        allergies,
        car_plate_number,
        confirmed,
        created_at
    ) VALUES (
        :guest_name,
        :contact_number,
        :bring_count,
        :companions_json,
        :adult_count,
        :kid_count,
        :allergies,
        :car_plate_number,
        :confirmed,
        CURRENT_TIMESTAMP
    )'
);

$statement->execute([
    ':guest_name' => $guestName,
    ':contact_number' => $contactNumber,
    ':bring_count' => $bringCount,
    ':companions_json' => json_encode($cleanCompanions, JSON_UNESCAPED_SLASHES),
    ':adult_count' => $adultCount,
    ':kid_count' => $kidCount,
    ':allergies' => $allergies,
    ':car_plate_number' => $carPlateNumber,
    ':confirmed' => $confirmed,
]);

send_json([
    'message' => 'RSVP saved.',
    'id' => (int) $pdo->lastInsertId(),
], 201);
