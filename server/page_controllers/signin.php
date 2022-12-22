<?php
include_once("../db/db.php");
class SignIn
{

    private $connection;
    private $errors;

    public function __construct()
    {
        //needs error handling
        $this->connection = new DataBaseConnection();
        $this->errors = array();
    }

    private function validateSignInForm($username, $password, $passwordRepeat)
    {
        $isValidUsername = (mb_strlen($username) >= 3);
        $isValidPassword = (mb_strlen($password) >= 6);
        if ($isValidUsername && $isValidPassword && strcmp($password, $passwordRepeat) == 0) {
            $this->errors['success'] = true;
        } else {
            $this->errors['success'] = false;
        }
    }

    public function validateSignIn()
    {
        if ($_POST) {
            $data = json_decode($_POST['data'], true);

            $username = $data['username'];
            $password = $data['password'];
            $passwordRepeat = $data['repeat-password'];
            $this->validateSignInForm($username, $password, $passwordRepeat);
            if ($this->errors['success']) {
                session_start();
                $hash = sha1($password);
                $_SESSION['user'] = $username;
                $query = $this->connection->insertNewUser(["username" => $username, "password" => $hash]);

                if ($query["success"]) {
                    echo json_encode(["success" => true, "message" => "User created"]);
                } else {
                    echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "User already exists"]);
                }
            } else {
                echo json_encode($this->errors);
            }
        }
    }

}
$login = new SignIn();
$login->validateSignIn();