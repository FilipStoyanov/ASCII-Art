<?php
class DataBaseConnection
{
    private $connection;

    private $insertUser;
    private $insertFollower;
    private $selectFollower;
    private $selectUser;
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

    private function prepareSQLStatements()
    {
        $sql = 'INSERT INTO user(username, password) VALUES (:username , :password_hash)';
        $this->insertUser = $this->connection->prepare($sql);

        $sql = 'INSERT INTO follower(user, follower) VALUES (:user, :follower)';
        $this->insertFollower = $this->connection->prepare($sql);

        $sql = 'SELECT follower FROM follower WHERE user = :user';
        $this->selectFollower = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM user WHERE username = :username AND password_hash = :password';
        $this->selectUser = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM user WHERE id = :id';
        $this->selectUserById = $this->connection->prepare($sql);
    }

    private function handleError($error)
    {
        $this->connection->rollBack();

        return ["success" => false, "error" => "Connection failed: " . $error->getMessage(), "code" => $error->getCode()];

    }

    //$input -> ["username" => value, "passowrd" => value]
    public function insertNewUser($input)
    {
        // var_dump($input);
        $hash = sha1($input["password"]);
        try {
            // var_dump (["username" => $input["username"], "password" => $hash]);
            $this->insertUser->execute(["username" => $input["username"], "password_hash" => $hash]);

            return ["success" => true];
        } catch (Exception $e) {
            // $this->handleError($e);
            // $this->connection->rollBack();

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

            $this->handleError($e);

        }
    }

    //$input = ["user" => value]
    public function getFollowers($input)
    {

        try {
            $this->selectFollower->execute($input);

            return ["success" => true, "data" => $this->selectFollower];
        } catch (Exception $e) {
            $this->handleError($e);
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
            // $response['success'] = false; //ne trqbva li da e true tuk? 🤔🤔

            return ["success" => false, "error" => "Invalid username or password"];
        } catch (Exception $e) {
            $this->handleError($e);
        }
    }

    //$input -> ["id" => value]
    public function getUserById($input)
    {
        try {
            $this->selectUserById->execute($input);

            return ["success" => true, "data" => $this->selectUserById];
        } catch (Exception $e) {
            $this->handleError($e);
        }

    }

    function __destruct()
    {
        $this->connection = null;
    }
}