<?php
class DataBaseConnection
{
    private $connection;

    private $insertUser;
    private $insertFollower;
    private $deleteFollower;
    private $selectFollower;
    private $selectUser;
    private $selectUserByName;
    private $selectUserById;

    public function __construct()
    {
        try {

            $db_credentials = parse_ini_file("config.ini", true);
            $this->connection = new PDO('mysql:host=localhost; dbname=ascii_art', $db_credentials["user"], $db_credentials["password"]);

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

        $sql = 'SELECT * FROM user WHERE username = :username AND password = :password';
        $this->selectUser = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM user WHERE username = :username';
        $this->selectUserByName = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM user WHERE id = :id';
        $this->selectUserById = $this->connection->prepare($sql);

    }

    public function deleteFollower($user, $follower)
    {
        $this->validateUsers([$user, $follower]);
        $this->deleteFollower->execute(["user" => $user, "password_hash" => $follower]);
    }

    private function validateUsers($users)
    {
        for ($i = 0; $i < count($users); ++$i) {
            if ($this->getUserById($users[$i]) == null) {
                http_response_code(404);
                die();
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

        if ($page != null && $page > 1) {
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
        $fellows ??= $stmt->fetch();
        $fellows_ids = array();
        if ($fellows) {
            foreach ($fellows as $key => $id)
                $current_user = self::getUserById($id);
            $fellows_ids[] = $current_user;
        }
        return $fellows_ids;
    }

    public function getUserByName($username)
    {
        $response = array();
        $result = $this->selectUserByName->execute(["username" => $username]);
        return $stmt->fetch();

    }

    //$input = ["user" => value]
    public function getFollowers($input)
    {

        try {
            $this->selectFollower->execute($input);

            return ["success" => true, "data" => $this->selectFollower];
        } catch (Exception $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];
        }
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
        try {
            $this->selectUserById->execute($input);

            return ["success" => true, "data" => $this->selectUserById];
        } catch (Exception $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];
        }

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
        try {
            $this->insertFollower->execute($input);

            return ["success" => true];
        } catch (Exception $e) {

            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];

        }
    }
}