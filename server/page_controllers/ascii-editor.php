<?php
    include_once("../db/db.php");    
    class Login {

        private $connection;
        private $errors;

        public function __construct()
        {
            $this->connection = new DatabaseConnection();
            $this->errors = array();
        }

        private function validateLoginForm($username, $password) {
            $isValidUsername = (mb_strlen($username) >= 3);
            $isValidPassword = (mb_strlen($password) >= 6);
            if($isValidUsername && $isValidPassword) {
                $this->errors['success'] = true;
            } else {
                $this->errors['success'] = false;
            }
        }

        public function validateLogin () {
            if($_POST) {
                $username = $_POST['username'];
                $password = $_POST['password'];
                $this->validateLoginForm($username, $password);
                if($this->errors['success']) {
                   session_start();
                   $hash = sha1($password);
                   $_SESSION['user'] = $username;
                   $this->connection->getUserByUsernameAndPassword($username, $hash);
                } else {
                   echo json_encode($this->errors);
                }
            }
        }

    }
    $login = new Login();
    $login->validateLogin();
