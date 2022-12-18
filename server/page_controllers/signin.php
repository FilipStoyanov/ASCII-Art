<?php
    include_once("../db/db.php");    
    class SignIn {

        private $connection;
        private $errors;

        public function __construct()
        {
            $this->connection = new DataBaseConnection();
            $this->errors = array();
        }

        private function validateSignInForm($username, $password, $passwordRepeat) {
            $isValidUsername = (mb_strlen($username) >= 3);
            $isValidPassword = (mb_strlen($password) >= 6);
            if($isValidUsername && $isValidPassword && strcmp($password, $passwordRepeat) == 0) {
                $this->errors['success'] = true;
            } else {
                $this->errors['success'] = false;
            }
        }

        public function validateSignIn () {
            if($_POST) {
                $username = $_POST['username'];
                $password = $_POST['password'];
                $passwordRepeat = $_POST['repeat-password'];
                $this->validateSignInForm($username, $password, $passwordRepeat);
                if($this->errors['success']) {
                   session_start();
                   $hash = sha1($password);
                   $_SESSION['user'] = $username;
                   $this->connection->insertNewUser($username, $hash);
                } else {
                      echo json_encode($this->errors);
                }
            }
        }

    }
    $login = new SignIn();
    $login->validateSignIn();
