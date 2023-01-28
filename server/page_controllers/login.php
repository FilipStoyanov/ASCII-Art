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
            $this->errors['message'] = "Invalid username or password";
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
                $query = $this->connection->getUserByUsernameAndPassword(["username" => $username, "password" => sha1($password)]);
                if(array_key_exists('user', $query)) {
                    $_SESSION['user'] = $query['user'];
                }
                if(array_key_exists('user_role', $query)) {
                    $userRole = $query['user_role'];
                }
                if ($query["success"]) {
                    echo json_encode(["success" => true, "message" => "Logged in", "token"=> JWT::generateToken($_SESSION['user'], $userRole), "username" => $username]);
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