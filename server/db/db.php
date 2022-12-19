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

    public function insertNewFollower($user, $follower)
    {
        $response = array();
        $insertUserQuery = 'insert into follower(user, follower) VALUES (?, ?)';
        $stmt = $this->connection->prepare($insertUserQuery);
        try {
            $stmt->execute([$user, $follower]);
            $response['success'] = true;
            return json_encode($response);
        } catch (Exception $e) {
            $response['success'] = false;
            return json_encode($response);
        }
    }

    public function getFollowers($user)
    {
        $response = array();
        $getFollowerQuery = 'select follower from follower where user = ?';
        $stmt = $this->connection->prepare($getFollowerQuery);
        try {
            $result = $stmt->execute([$user]);
            $followers ??= $stmt->fetch();
            $followers_ids = array();
            if ($followers) {
                foreach ($followers as $key => $id)
                    $current_user = self::getUserById($id);
                $followers_ids[] = $current_user;
            }
            $response['followers'] = $followers_ids;
            $response['success'] = true;
            return json_encode($response);
        } catch (Exception $e) {
            $response['success'] = false;
            $response['error_message'] = $e->getMessage();
            return json_encode($response);
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

    public function getUserById($id)
    {
        $response = array();
        $getUserQuery = 'select * from user where id = ?';
        $stmt = $this->connection->prepare($getUserQuery);

        try {
            $result = $stmt->execute([$id]);
            $user ??= $stmt->fetch();
            return $user;
            if ($user) {
                return $user;
            }
        } catch (Exception $e) {
            return null;
        }
        return null;
    }
}