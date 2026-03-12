<?php
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$email = $data["email"];

$apiKey = "re_THBwtMHy_MGwxru7GSMjpiVeCXkTzNV4b"; // Tu API KEY

$payload = [
    "from" => "onboarding@resend.dev",
    "to" => $email,
    "subject" => "Recuperar contraseña",
    "html" => "<p>Haz clic en este enlace para recuperar tu contraseña:</p>
               <a href='https://google.com'>Recuperar</a>"
];

$ch = curl_init("https://api.resend.com/emails");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "Authorization: Bearer $apiKey"
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
curl_close($ch);

echo $response;
