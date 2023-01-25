<?php
include_once("../db/db.php");
include_once("../jwt/jwt.php");
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
                $query = $this->connection->getUserByUsernameAndPassword(["username" => $username, "password" => $hash]);
                $_SESSION['user'] = $query['user'];
                $userRole = $query['user_role'];

                if ($query["success"]) {
                    echo json_encode(["success" => true, "message" => "Logged in", "token"=> JWT::generateToken($_SESSION['user'], $userRole)]);
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