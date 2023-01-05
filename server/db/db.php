<?php
class DataBaseConnection
{
    private $connection;

    private $insertUser;
    private $insertFollower;
    private $deleteFollower;
    private $selectFollower;
    private $selectUserAndFollower;
    private $selectUser;
    // private $selectUserByName;
    private $selectUserById;

    public function __construct()
    {
        try {

            $db_credentials = parse_ini_file("config.ini", true);
            $this->connection = new PDO('mysql:host=localhost; dbname=ascii_art1', $db_credentials["user"], $db_credentials["password"]);

            $this->prepareSQLStatements();
        } catch (PDOException $error) {
            echo "Connection to db failed: " . $error->getMessage();
        }
    }

    //prepare the sql statements => execute them later
    private function prepareSQLStatements()
    {
        $sql = 'INSERT INTO user(username, password) VALUES (:username , :password_hash)';
        $this->insertUser = $this->connection->prepare($sql);

        $sql = 'INSERT INTO follower(user, follower) VALUES (:user, :follower)';
        $this->insertFollower = $this->connection->prepare($sql);

        $sql = 'DELETE FROM follower WHERE user=:user and follower=:follower';
        $this->deleteFollower = $this->connection->prepare($sql);

        $sql = 'SELECT follower FROM follower WHERE user = :user';
        $this->selectFollower = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM follower WHERE user = :user AND follower = :follower';
        $this->selectUserAndFollower = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM user WHERE username = :username AND password = :password';
        $this->selectUser = $this->connection->prepare($sql);

        // TODO like %:username%
        // $sql = "SELECT * FROM user WHERE username LIKE :username";
        // $this->selectUserByName = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM user WHERE id = :user';
        $this->selectUserById = $this->connection->prepare($sql);

    }

    //$input -> ["user" => value, "follower" => value]
    public function deleteFollower($input)
    {
        $this->validateUsers([$input['user'], $input['follower']]);
        $this->deleteFollower->execute(["user" => $input['user'], "follower" => $input['follower']]);
    }

    private function validateUsers($users)
    {
        for ($i = 0; $i < count($users); ++$i) {
            if ($this->getUserById(['user' => $users[$i]]) == null) {
                throw new Exception('User with id ' . +$users[$i] . ' was not found.');
            }
        }
    }

    public function getFollowers($user, $page, $limit)
    {
        return $this->getFellows($user, 'follower', 'user', $page, $limit);
    }




    public function getFollowings($user, $page, $limit)
    {
        return $this->getFellows($user, 'user', 'follower', $page, $limit);
    }

    private function getFellows($user, $searched_value, $role, $page, $limit)
    {

        if ($page != null && $page >= 1) {
            $start = (($page - 1) * $limit);
        } else {
            $page = null;
        }

        $query = 'select ' . $searched_value . ' from follower where ' . $role . ' = ?';
        if ($page != null) {
            $query = $query . ' limit ' . $start . ', ' . $limit . '';
        }
        $stmt = $this->connection->prepare($query);
        $stmt->execute([$user]);
        $fellows_ids ??= $stmt->fetchAll();
        $fellows = array();
        if ($fellows_ids) {
            foreach ($fellows_ids as $fellow_id) {
                $current_user = $this->getUserById(['user' => $fellow_id[0]]);
                $fellows[] = $current_user;
            }

        }
        return $fellows;
    }

    public function getUserByName($username, $page, $limit)
    {
        if ($page != null && $page >= 1) {
            $start = (($page - 1) * $limit);
        } else {
            $page = null;
        }
        $sql = "SELECT * FROM user WHERE username LIKE %" . $username . "%";

        if ($page != null) {
            $sql = $sql . ' limit ' . $start . ', ' . $limit . '';
        }
        $stmt = $this->connection->prepare($sql);
        $stmt->execute([]);
        return $stmt->fetchAll();
    }



    //$input -> ["username" => value, "passowrd" => value]
    public function getUserByUsernameAndPassword($input)
    {

        $hash = sha1($input["password"]);

        try {
            $this->selectUser->execute(["username" => $input["username"], "password" => $hash]);
            $user = $this->selectUser->fetch();
            if ($user) {
                return ["success" => true];
            }

            return ["success" => false, "error" => "Invalid username or password", "code" => 403];
        } catch (Exception $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];
        }
    }

    //$input -> ["id" => value]
    public function getUserById($input)
    {
        $response = array();
        try {
            $result = $this->selectUserById->execute($input);
            $user ??= $this->selectUserById->fetch();
            if ($user) {
                return $user;
            }
        } catch (Exception $e) {
            return null;
        }
        return null;
    }

    function __destruct()
    {
        $this->connection = null;
    }

    //$input -> ["username" => value, "passowrd" => value]
    public function insertNewUser($input)
    {
        $hash = sha1($input["password"]);
        try {
            $this->insertUser->execute(["username" => $input["username"], "password_hash" => $hash]);

            return ["success" => true];
        } catch (Exception $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];
        }
    }

    //$input -> ["user" => value, "follower" => value]
    public function insertNewFollower($input)
    {
        $this->validateUsers([$input['user'], $input['follower']]);
        $this->insertFollower->execute($input);
    }

    public function getAllFilteredUsers($userId, $page, $limit)
    {
        $users = $this->getAllUsers($page, $limit);
        // checks which user is follower to out user and set flag is_follower=True and check if it is a following and set is_following=True 
        $users = array_map(function ($v) use ($userId) {
            return $this->getFollowStatus($userId, $v);
        }, $users);
        return $users;
    }

    private function getFollowStatus($userId, $other)
    {
        $other['is_follower'] = $this->isFollower(['user' => $userId, 'follower' => $other['id']]);
        $other['is_following'] = $this->isFollower(['user' => $other['id'], 'follower' => $userId]);
        return $other;
    }

    private function isFollower($input)
    {
        $this->selectUserAndFollower->execute($input);
        if ($this->selectUserAndFollower->fetch() == null) {
            return false;
        }
        return true;
    }

    public function getAllUsers($page, $limit)
    {
        if ($page != null && $page >= 1) {
            $start = (($page - 1) * $limit);
        } else {
            $page = null;
        }

        $query = 'select * from user ';
        if ($page != null) {
            $query = $query . ' limit ' . $start . ', ' . $limit . '';
        }
        $stmt = $this->connection->prepare($query);
        $stmt->execute([]);
        $users_ids ??= $stmt->fetchAll();
        $users = array();
        if ($users_ids) {
            foreach ($users_ids as $id) {
                $current_user = $this->getUserById(['user' => $id[0]]);
                $users[] = $current_user;
            }

        }
        return $users;
    }
}