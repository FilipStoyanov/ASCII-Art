<?php
class DataBaseConnection
{
    private $connection;

    private $insertUser;
    private $insertFollower;
    private $insertNewAsciiText;
    private $selectAsciiPictures;
    private $selectAsciiPicture;
    private $getPictureById;
    private $selectAllPictures;
    private $selectAllFriendsPictures;
    private $deleteFollower;
    private $selectFollower;
    private $selectUserAndFollower;
    private $selectUser;
    // private $selectUserByName;
    private $selectUserById;
    private $updateAsciiPicture;
    private $removeAsciiPicture;
    private $insertVideo;
    private $selectVideos;
    private $getLikesCount;
    private $addLike;
    private $deleteLike;
    private $updateLikesCount;
    private $selectLikeByUserAndPicture;

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
        $sql = 'INSERT INTO user(username, password_hash) VALUES (:username , :password_hash)';
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

        // $sql = 'SELECT id,title, time_delay, color, background, frames FROM videos WHERE owner_id = :owner_id';
        // $this->selectVideos = $this->connection->prepare($sql);
        $sql = 'DELETE FROM follower WHERE user=:user and follower=:follower';
        $this->deleteFollower = $this->connection->prepare($sql);

        $sql = 'SELECT follower FROM follower WHERE user = :user';
        $this->selectFollower = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM follower WHERE user = :user AND follower = :follower';
        $this->selectUserAndFollower = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM user WHERE username = :username AND password_hash = :password';
        $this->selectUser = $this->connection->prepare($sql);

        // TODO like %:username%
        // $sql = "SELECT * FROM user WHERE username LIKE :username";
        // $this->selectUserByName = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM user WHERE id = :user';
        $this->selectUserById = $this->connection->prepare($sql);

        $sql = 'INSERT INTO pictures(value, name, color, owner_id) values(:value, :name, :color, :owner_id)';
        $this->insertNewAsciiText = $this->connection->prepare($sql);

        $sql = 'SELECT name from pictures where owner_id = :owner_id';
        $this->selectAsciiPictures = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM PICTURES WHERE id = :picture';
        $this->getPictureById = $this->connection->prepare($sql);

        $sql = 'SELECT value, color, name, created_at, updated_at from pictures where owner_id = :owner_id and name = :name';
        $this->selectAsciiPicture = $this->connection->prepare($sql);

        $sql = 'UPDATE pictures set value = :value, color = :color, name = :name, updated_at = current_timestamp where owner_id = :owner_id and name = :previous_name';
        $this->updateAsciiPicture = $this->connection->prepare($sql);

        $sql = 'DELETE from pictures where owner_id = :owner_id and name = :name';
        $this->removeAsciiPicture = $this->connection->prepare($sql);

        $sql = 'SELECT p.id, p.value, p.color, p.name as picture_name, u.username, p.created_at, p.updated_at from pictures p join user u on p.owner_id = u.id where owner_id = :owner_id';
        $this->selectAllPictures = $this->connection->prepare($sql);

        $sql = 'SELECT likes FROM PICTURES WHERE id = :picture';
        $this->getLikesCount = $this->connection->prepare($sql);

        $sql = 'INSERT INTO LIKED(user,picture) values(:user,:picture)';
        $this->addLike = $this->connection->prepare($sql);

        $sql = 'DELETE FROM LIKED WHERE user=:user and picture=:picture';
        $this->deleteLike = $this->connection->prepare($sql);

        $sql = 'UPDATE PICTURES SET LIKES = LIKES + :difference WHERE id=:picture';
        $this->updateLikesCount = $this->connection->prepare($sql);

        $sql = 'SELECT * FROM LIKED WHERE user=:user AND picture=:picture';
        $this->selectLikeByUserAndPicture = $this->connection->prepare($sql);
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
            $this->validateUser($users[$i]);
        }
    }

    private function validateUser($user)
    {
        if ($this->getUserById(['user' => $user]) == null) {
            throw new Exception('User with id ' . +$user . ' was not found.');
        }
    }

    private function validatePicture($picture)
    {
        $this->getPictureById->execute(['picture' => $picture]);
        if ($this->getPictureById->fetch() == null) {
            throw new Exception('Picture with id ' . +$picture . ' was not found.');
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

    public function getUserByName($username, $page, $limit, $userId)
    {
        if ($page != null && $page >= 1) {
            $start = (($page - 1) * $limit);
        } else {
            $page = null;
        }
        $sql = "SELECT * FROM user WHERE username LIKE '%" . $username . "%'";

        if ($page != null) {
            $sql = $sql . ' limit ' . $start . ', ' . $limit . '';
        }

        $stmt = $this->connection->prepare($sql);
        $stmt->execute([]);
        $users = $stmt->fetchAll();
        // checks which user is follower to out user and set flag is_follower=True and check if it is a following and set is_following=True 
        $users = array_map(function ($v) use ($userId) {
            return $this->getFollowStatus($userId, $v);
        }, $users);
        return $users;
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

    //$input -> ["value" => value, "name" => value, "color" => value, "owner_id" => value, "previous_name" => value]
    public function insertNewAsciiText($input)
    {
        try {
            $this->insertNewAsciiText->execute($input);
            return ["success" => true];
        } catch (PDOException $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->errorInfo[1]];
        }
    }

    //$input -> ["owner_id" => value]
    public function getAsciiPictures($input)
    {
        try {
            // $this->selectAsciiPictures->execute($input);
            // $asciiPictures = $this->selectAsciiPictures->fetchAll();

            $page = $input['page'];
            $limit = $input['limit'];
            if ($page != null && $page >= 1) {
                $start = (($page - 1) * $limit);
            } else {
                $page = null;
            }
            $query = 'SELECT name from pictures where owner_id = :owner_id';
            if ($page != null) {
                $query = $query . ' limit ' . $start . ', ' . $limit . '';
            }
            $stmt = $this->connection->prepare($query);
            $stmt->execute(["owner_id" => $input["owner"]]);
            $asciiPictures = $stmt->fetchAll();
            return ["success" => true, "data" => $asciiPictures];
        } catch (PDOException $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->errorInfo[1]];
        }
    }

    //$input -> ["owner_id" => value, "name" => value]
    public function getAsciiPictureByName($input)
    {
        try {
            $this->selectAsciiPicture->execute($input);
            $asciiPicture = $this->selectAsciiPicture->fetchAll();
            return ["success" => true, "data" => $asciiPicture];
        } catch (PDOException $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->errorInfo[1]];
        }
    }


    private function setLikes($user, $pictures)
    {
        for ($i = 0; $i < count($pictures); $i++) {
            $pictures[$i] = ['data' => $pictures[$i], 'liked' => $this->isLiked($user, $pictures[$i]), 'likes_count' => $this->getLikesCount(['picture' => $pictures[$i]['id']])['likes']];
        }
        return $pictures;
    }

    //$input -> ["user" => value, "owner" => value]
    public function getAllAsciiPictures($input)
    {

        $page = $input['page'];
        $limit = $input['limit'];
        if ($page != null && $page >= 1) {
            $start = (($page - 1) * $limit);
        } else {
            $page = null;
        }
        $query = 'SELECT p.id, p.value, p.color, p.name as picture_name, u.username, p.created_at, p.updated_at from pictures p join user u on p.owner_id = u.id where owner_id = :owner_id';
        if ($page != null) {
            $query = $query . ' limit ' . $start . ', ' . $limit . '';
        }

        $stmt = $this->connection->prepare($query);
        $stmt->execute(["owner_id" => $input['owner']]);
        $asciiPictures = $stmt->fetchAll();
        $pictures = $this->setLikes($input["user"], $asciiPictures);
        return $pictures;
    }




    private function isLiked($user, $picture)
    {
        $this->selectLikeByUserAndPicture->execute(["user" => $user, "picture" => $picture['id']]);
        $picture = $this->selectLikeByUserAndPicture->fetch();
        return $picture != null;
    }

    //$input -> ["owner_id" => value, "page" => value, "pageSize" => value] 
    public function getAllFriendsPictures($input)
    {
        $page = $input['page'];
        $limit = $input['limit'];
        if ($page != null && $page >= 1) {
            $start = (($page - 1) * $limit);
        } else {
            $page = null;
        }

        $sql = 'SELECT p.id, p.value, p.color, p.name as picture_name,p.owner_id, p.updated_at from pictures p ' .
            'where p.owner_id in (select f.user from follower f where follower = ' . $input['user'] . ') order by p.updated_at desc ';

        if ($page != null) {
            $sql = $sql . ' limit ' . $start . ', ' . $limit . '';
        }
        $this->selectAllFriendsPictures = $this->connection->prepare($sql);
        $this->selectAllFriendsPictures->execute([]);
        $asciiPictures = $this->selectAllFriendsPictures->fetchAll();
        $pictures = $this->setLikes($input["user"], $asciiPictures);
        $pictures = $this->setUsers($pictures);
        return $pictures;

    }

    function setUsers($pictures)
    {
        for ($i = 0; $i < count($pictures); $i++) {
            $pictures[$i] = ['data' => $pictures[$i]['data'], 'liked' => $pictures[$i]['liked'], 'likes_count' => $pictures[$i]['likes_count'], 'owner' => $this->getUserById(['user' => (int) $pictures[$i]['data']['owner_id']])];
        }
        return $pictures;
    }

    //$input -> ["value" => value, "color" => value, "name" => value, "owner_id" => value]
    public function updateAsciiPicture($input)
    {
        try {
            $this->updateAsciiPicture->execute($input);
            return ["success" => true];
        } catch (PDOException $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->errorInfo[1]];
        }
    }

    //$input -> ["owner_id" => value, "name" => value]
    public function deleteAsciiPicture($input)
    {
        try {
            $this->removeAsciiPicture->execute($input);
            return ["success" => true];
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

    //$input -> ["owner_id" => value, "page"=>value, "limit"=>value]
    public function getAsciiVideos($input)
    {
        $page = $input['page'];
        $limit = $input['limit'];
        if ($page != null && $page >= 1) {
            $start = (($page - 1) * $limit);
        } else {
            $page = null;
        }

        $query = 'SELECT id,title, time_delay, color, background, frames FROM videos WHERE owner_id = ' . $input['owner_id'];
        if ($page != null) {
            $query = $query . ' limit ' . $start . ', ' . $limit . '';
        }
        try {
            $stmt = $this->connection->prepare($query);
            $stmt->execute([]);
            $videos = $stmt->fetchAll();

            return ["success" => true, "data" => $videos];
        } catch (Exception $e) {
            return ["success" => false, "error" => "Connection failed: " . $e->getMessage(), "code" => $e->getCode()];
        }
    }


    public function getFriendsVideos($input)
    {
        $page = $input['page'];
        $limit = $input['limit'];
        if ($page != null && $page >= 1) {
            $start = (($page - 1) * $limit);
        } else {
            $page = null;
        }

        $query = 'SELECT v.id,v.title, v.time_delay, v.color, v.background, v.frames,v.updated_at FROM videos v WHERE v.owner_id in (select f.user from follower f where follower = ' . $input['user'] . ') order by v.updated_at desc ';
        if ($page != null) {
            $query = $query . ' limit ' . $start . ', ' . $limit . '';
        }
        $stmt = $this->connection->prepare($query);
        $stmt->execute([]);
        $videos = $stmt->fetchAll();

        return $videos;
    }

    function setUserToVideo($videos)
    {
        for ($i = 0; $i < count($videos); $i++) {
            $videos[$i] = ['data' => $videos[$i]['data'], 'owner' => $this->getUserById(['user' => (int) $videos[$i]['data']['owner_id']])];
        }
        return $videos;
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

    function getLikesCount($input)
    {
        $this->getLikesCount->execute($input);
        return $this->getLikesCount->fetch();
    }

    function addLike($input)
    {
        $this->validateUser($input['user']);
        $this->validatePicture($input['picture']);

        $this->addLike->execute($input);
    }

    function deleteLike($input)
    {
        $this->validateUser($input['user']);
        $this->validatePicture($input['picture']);

        $this->deleteLike->execute($input);
    }

    function updateLikesCount($input)
    {
        $this->updateLikesCount->execute($input);
    }


}