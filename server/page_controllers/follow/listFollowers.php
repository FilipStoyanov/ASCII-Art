<?php
include_once("../../db/db.php");
// include_once("./db/db.php");
include_once("fellow.php");
class Follower
{
    private $connection;
    private $fellow;

    public function __construct()
    {
        $this->connection = new DatabaseConnection();
        $this->fellow = new Fellow();
    }


    public function getFollowers()
    {
        $url = $_SERVER['REQUEST_URI'];
        $components = parse_url($url);
        parse_str($components['query'], $pathParameters);
        return $this->fellow->getFellows(function ($user, $page, $limit) {
            return $this->connection->getFollowers($user, $page, $limit);
        },'followers',$pathParameters);
    }
}

$follow = new Follower();
echo $follow->getFollowers();
?>