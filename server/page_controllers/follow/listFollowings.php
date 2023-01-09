<?php
include_once("../../db/db.php");
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
        $url = $_SERVER['REQUEST_URI'];
        $components = parse_url($url);
        parse_str($components['query'], $pathParameters);
        return $this->fellow->getFellows(function ($user, $page, $limit) {
            return $this->connection->getFollowings($user, $page, $limit);
        },'followings', $pathParameters);
    }

}

$following = new Following();
echo $following->getFollowings();
?>