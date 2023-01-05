<?php
class DataBaseConnection
{
    private $connection;

    private $insertUser;
    private $insertFollower;
    private $selectFollower;
    private $selectUser;
    private $selectUserById;
    private $insertVideo;
    private $selectVideos;

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

        $sql = 'INSERT INTO videos(title, owner_id,color, background, time_delay, frames) VALUES (
            :title, 
            :owner_id, 
            :color, 
            :background, 
            :time,
            :frames)';
        $this->insertVideo = $this->connection->prepare($sql);

        $sql = 'SELECT title, time_delay, color, background, frames FROM videos WHERE owner_id = :owner_id';
        $this->selectVideos = $this->connection->prepare($sql);

        $sql = 'SELECT follower FROM follower WHERE user = :user';
        $this->selectFollower = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM user WHERE username = :username AND password = :password';
        $this->selectUser = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM user WHERE id = :id';
        $this->selectUserById = $this->connection->prepare($sql);
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

    //
    public function insertNewAsciiVideo($input)
    {
        try {
            $this->insertVideo->execute($input);

            return ["success" => true];
        } catch (Exception $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];
        }
    }

    //$input -> ["owner_id" => value]
    public function getAsciiVideos($input)
    {
        try {
            $this->selectVideos->execute($input);
            $videos = $this->selectVideos->fetchAll();
            
            return ["success" => true, "data" => $videos];
        } catch (Exception $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];
        }
    }

    function __destruct()
    {
        $this->connection = null;
    }
}