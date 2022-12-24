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
        // TODO check whether the same tuple exists in the database
        $this->validateUsers([$user, $follower]);
        $response = array();
        $insertUserQuery = 'insert into follower(user, follower) VALUES (?, ?)';
        $stmt = $this->connection->prepare($insertUserQuery);
        $stmt->execute([$user, $follower]);
    }

    public function deleteFollower($user, $follower)
    {
        $this->validateUsers([$user, $follower]);
        $response = array();
        $insertUserQuery = 'delete from follower where user=? and follower=?';
        $stmt = $this->connection->prepare($insertUserQuery);
        $stmt->execute([$user, $follower]);
    }
    
    private function validateUsers($users){
        for($i=0;$i<count($users);++$i){
            if($this->getUserById($users[$i]) == null){
                http_response_code(404);
                die();
            }
        }
    }

    public function getFollowers($user)
    {
        return $this->getFellows($user,'follower', 'user');
    }




    public function getFollowings($user)
    {
        return $this->getFellows($user,'user', 'follower');
    }

    private function getFellows($user,$searched_value, $role)
    {
        $response = array();
        $getFollowerQuery = 'select '.$searched_value.' from follower where ' . $role . ' = ?';
        $stmt = $this->connection->prepare($getFollowerQuery);

        $result = $stmt->execute([$user]);
        $fellows ??= $stmt->fetch();
        $fellows_ids = array();
        if ($fellows) {
            foreach ($fellows as $key => $id)
                $current_user = self::getUserById($id);
            $fellows_ids[] = $current_user;
        }
        return $fellows_ids;
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