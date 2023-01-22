<?php
class JWT
{

    public function verify($token)
    {
        // Set the secret key
        $secretKey = 'your_secret_key';


        // Split the JWT into parts
        $jwtParts = explode('.', $token);

        // Decode the payload
        $payloadJson = base64_decode($jwtParts[0]);
        $payload = json_decode($payloadJson, true);

        // Check if the JWT is expired
        if (time() > $payload['exp']) {
            // JWT is expired
            return null;
        } else {
            // JWT is not expired
            // Refresh the expiration time
            $payload['exp'] = time() + (60 * 60); // 1 hour
            $payloadJson = json_encode($payload);
            $base64UrlPayload = base64_encode($payloadJson);
            // Create the signature
            $signature = hash_hmac('sha256', $base64UrlPayload, $secretKey, true);
            $base64UrlSignature = base64_encode($signature);
            // Create the new JWT
            $newJwt = "$base64UrlPayload.$base64UrlSignature";
            // Print the new JWT
            return ['token'=>$newJwt,'user'=>$payload['user']];
        }
    }
}


?>