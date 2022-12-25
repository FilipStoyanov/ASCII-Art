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
                    echo json_encode(["success" => true, "message" => "Logged in"]);
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