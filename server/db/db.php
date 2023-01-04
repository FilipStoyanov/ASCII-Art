<?php
class DataBaseConnection
{
    private $connection;

    private $insertUser;
    private $insertFollower;
    private $insertNewAsciiText;
    private $selectAsciiPictures;
    private $selectAsciiPicture;
    private $selectFollower;
    private $selectUser;
    private $selectUserById;
    private $updateAsciiPicture;
    private $removeAsciiPicture;

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
        $sql = 'INSERT INTO user(username, password_hash) VALUES (:username , :password_hash)';
        $this->insertUser = $this->connection->prepare($sql);

        $sql = 'INSERT INTO follower(user, follower) VALUES (:user, :follower)';
        $this->insertFollower = $this->connection->prepare($sql);

        $sql = 'SELECT follower FROM follower WHERE user = :user';
        $this->selectFollower = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM user WHERE username = :username AND password_hash = :password';
        $this->selectUser = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM user WHERE id = :id';
        $this->selectUserById = $this->connection->prepare($sql);

        $sql = 'INSERT INTO pictures(value, name, color, owner_id) values(:value, :name, :color, :owner_id)';
        $this->insertNewAsciiText = $this->connection->prepare($sql);

        $sql = 'SELECT name from pictures where owner_id = :owner_id';
        $this->selectAsciiPictures = $this->connection->prepare($sql);

        $sql = 'SELECT value, color, name from pictures where owner_id = :owner_id and name = :name';
        $this->selectAsciiPicture = $this->connection->prepare($sql);

        $sql = 'UPDATE pictures set value = :value, color = :color, name = :name where owner_id = :owner_id and name = :previous_name';
        $this->updateAsciiPicture = $this->connection->prepare($sql);

        $sql = 'DELETE from pictures where owner_id = :owner_id and name = :name';
        $this->removeAsciiPicture = $this->connection->prepare($sql);
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

    //$input -> ["value" => value, "name" => value, "color" => value, "owner_id" => value, "previous_name" => value]
    public function insertNewAsciiText($input) {
        try {
            $this->insertNewAsciiText->execute($input);
            return ["success" => true];
        } catch(Exception $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];
        }
    }

    //$input -> ["owner_id" => value]
    public function getAsciiPictures($input) {
        try {
            $this->selectAsciiPictures->execute($input);
            $asciiPictures = $this->selectAsciiPictures->fetchAll();
            return ["success" => true, "data" => $asciiPictures];
        }catch(Exception $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];
        }
    }

    //$input -> ["owner_id" => value, "name" => value]
    public function getAsciiPictureByName($input) {
        try {
            $this->selectAsciiPicture->execute($input);
            $asciiPicture = $this->selectAsciiPicture->fetchAll();
            return ["success" => true, "data" => $asciiPicture];
        }catch(Exception $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];
        }
    }

    //$input -> ["value" => value, "color" => value, "name" => value, "owner_id" => value]
    public function updateAsciiPicture($input) {
        try {
            $this->updateAsciiPicture->execute($input);
            return ["success" => true];
        }catch(Exception $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];
        }
    }

    //$input -> ["owner_id" => value, "name" => value]
    public function deleteAsciiPicture($input) {
        try {
            $this->removeAsciiPicture->execute($input);
            return ["success" => true];
        }catch(Exception $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];
        }
    }

    function __destruct()
    {
        $this->connection = null;
    }
}