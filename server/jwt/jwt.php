<?php
class JWT
{

    public static function base64url_encode($str)
    {
        return rtrim(strtr(base64_encode($str), '+/', '-_'), '=');
    }

    public static function verify($token)
    {
        $secret = 'secret';
        // split the jwt
        $tokenParts = explode('.', $token);
        if(count($tokenParts) <2){
            return null;
        }
        $header = base64_decode($tokenParts[0]);
        $payload = base64_decode($tokenParts[1]);

        // check the expiration time - note this will cause an error if there is no 'exp' claim in the jwt
        $decodedPayload = json_decode($payload, true);
        $refreshExpiration = null;
        $expiration = null;
        if($decodedPayload == null || !array_key_exists('refresh_exp', $decodedPayload) || !array_key_exists('exp', $decodedPayload)) {
            return null;
        }
        $refreshExpiration = $decodedPayload['refresh_exp'];
        $expiration = $decodedPayload['exp'];

        // build a signature based on the header and payload using the secret
        $headers = array('alg' => 'HS256', 'typ' => 'JWT');
        $base64UrlHeader = self::base64url_encode($header);
        $base64UrlPayload = self::base64url_encode($payload);
        $signature = hash_hmac('SHA256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);

        // verify it matches the signature provided in the jwt
        if ($refreshExpiration == null || $expiration == null) {
            return null;
        }
        if (($refreshExpiration - time()) < 0 || ($expiration - time()) < 0) {
            return null;
        } else {
            $decodedPayload['refresh_exp'] = time() + (210 * 60);
            $decodedPayload['exp'] = $expiration;
            $headersEncoded = self::base64url_encode(json_encode($headers));
            $payloadEncoded = self::base64url_encode(json_encode($decodedPayload));
            $signature = hash_hmac('SHA256', "$headersEncoded.$payloadEncoded", $secret, true);
            $signatureEncoded = self::base64url_encode($signature);
            $jwt = "$headersEncoded.$payloadEncoded.$signatureEncoded";
            return $jwt;
        }
    }

    public static function generateToken($user, $userRole = "USER")
    {
        $headers = array('alg' => 'HS256', 'typ' => 'JWT');
        $secretKey = 'secret';

        $userId = $user;

        $refreshExpiration = time() + (210 * 60);
        $expiration = time() + (360 * 60);

        $headers_encoded = self::base64url_encode(json_encode($headers));

        $payload = array(
            'id' => $userId,
            'role' => $userRole,
            'refresh_exp' => $refreshExpiration,
            'exp' => $expiration
        );

        $payload_encoded = self::base64url_encode(json_encode($payload));

        $signature = hash_hmac('SHA256', "$headers_encoded.$payload_encoded", $secretKey, true);
        $signature_encoded = self::base64url_encode($signature);

        $jwt = "$headers_encoded.$payload_encoded.$signature_encoded";

        return $jwt;
    }

    public static function fetchUserFromJWT($token)
    {
        $tokenParts = explode('.', $token);
        $payload = base64_decode($tokenParts[1]);
        $decoded_payload = json_decode($payload, true);
        return ["id" => $decoded_payload['id'], "role" => $decoded_payload['role']];
    }
}
