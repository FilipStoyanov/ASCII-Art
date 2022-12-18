<?php
class DataBaseConnection
{
    protected $connection;

    public function __construct()
    {
        $db_credentials = parse_ini_file("config.ini", true);
        $this->connection = new PDO('mysql:host=localhost; dbname=ascii_art', $db_credentials["user"], $db_credentials["password"]);
    }

    public function insertNewUser($username, $password)
    {
        $response = array();
        $insertUserQuery = 'insert into user(username, password_hash) VALUES (?, ?)';
        $hash = sha1($password);
        $stmt = $this->connection->prepare($insertUserQuery);
        try {
            $result = $stmt->execute([$username, $hash]);
            $response['success'] = true;
            echo json_encode($response);
        } catch (Exception $e) {
            $error = $e->errorInfo;
            $response['success'] = false;
            $response['errors'] = array();
            $response['errors']['name'] = "Duplicate username";
            if ($error[1] == 1062) {
                echo json_encode($response);
            }
        }
    }

    public function getUserByUsernameAndPassword($username, $password)
    {
        $response = array();
        $getUserQuery = 'select * from user where username = ? and password_hash = ?';
        $hash = sha1($password);
        $stmt = $this->connection->prepare($getUserQuery);

        try {
            $result = $stmt->execute([$username, $hash]);
            $user ??= $stmt->fetch();
            if ($user) {
                $response['success'] = true;
            } else {
                $response['success'] = false;
                $response['error'] = "Invalid username or password";
            }
            echo json_encode($response);
        } catch (Exception $e) {
            $error = $e->errorInfo;
            $response['success'] = false;
            $response['error'] = $error[2];
            echo json_encode($response);
        }
    }
}
