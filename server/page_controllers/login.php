<?php
include_once("../db/db.php");
class Login
{

    private $connection;
    private $errors;

    public function __construct()
    {
        //need error handling
        $this->connection = new DatabaseConnection();
        $this->errors = array();
    }

    private function validateLoginForm($username, $password)
    {
        $isValidUsername = (mb_strlen($username) >= 3);
        $isValidPassword = (mb_strlen($password) >= 6);
        if ($isValidUsername && $isValidPassword) {
            $this->errors['success'] = true;
        } else {
            $this->errors['success'] = false;
        }
    }

    private function generateToken($user){
        $secretKey = 'secret';
        
        $userId = 1;
        
        $expiration = time() + (60 * 60);

        $payload = array(
            'id' => $userId,
            'exp' => $expiration
        );
        
        // Encode the payload as a JSON object
        $payloadJson = json_encode($payload);
        
        // Base64 encode the JSON object
        $base64UrlPayload = base64_encode($payloadJson);
        
        // Create the signature
        $signature = hash_hmac('sha256', $base64UrlPayload, $secretKey, true);
        
        // Base64 encode the signature
        $base64UrlSignature = base64_encode($signature);
        
        // Create the JWT
        $jwt = "$base64UrlPayload.$base64UrlSignature";
        
        // Print the generated JWT
        return $jwt;
    }

    public function validateLogin()
    {
        if ($_POST) {
            $data = json_decode($_POST["data"], true);

            $username = $data['username'];
            $password = $data['password'];
            $this->validateLoginForm($username, $password);
            if ($this->errors['success']) {
                session_start();
                $hash = sha1($password);
                $_SESSION['user'] = $username;

                $query = $this->connection->getUserByUsernameAndPassword(["username" => $username, "password" => $hash]);

                if ($query["success"]) {
                    echo json_encode(["success" => true, "message" => "Logged in", "token"=> $this->generateToken($query['user'])]);
                } else {
                    echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Wrong username or password"]);
                }

            } else {
                echo json_encode($this->errors);
            }
        }
    }

}
$login = new Login();
$login->validateLogin();