<?php
include_once("../db/db.php");
include_once("fellow.php");
class Following
{

    private $connection;
    private $fellow;

    public function __construct()
    {
        $this->connection = new DatabaseConnection();
        $this->fellow = new Fellow();
    }

    public function getFollowings()
    {
        return $this->fellow->getFellows(function ($user, $page, $limit) {
            return $this->connection->getFollowings($user, $page, $limit);
        },'followings');
    }

}

$following = new Following();
echo $following->getFollowings();
?>