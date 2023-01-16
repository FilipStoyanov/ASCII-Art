<?php
include_once("../../db/db.php");
// include_once("./db/db.php");
include_once("fellow.php");
class UpdateFollower
{

    private $connection;
    private $fellow;
    private $response;

    public function __construct()
    {
        $this->connection = new DatabaseConnection();
        $this->fellow = new Fellow();
        $this->response = array();
    }
    private function addFollower()
    {
        $addFollower = function ($user, $follower) {
            $this->connection->insertNewFollower(["user" => $user, "follower" => $follower]);
        };
        return $this->fellow->updateFollower('POST', $addFollower);
    }



    private function removeFollower()
    {
        $deleteFollower = function ($user, $follower) {
            $this->connection->deleteFollower(["user" => $user, "follower" => $follower]);
        };
        return $this->fellow->updateFollower('DELETE', $deleteFollower);
    }

    public function changeFollower()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            return $this->addFollower();
        }
        if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
            return $this->removeFollower();
        }
        $this->response['success'] = false;
        $this->response['error'] = 'WRONG HTTP Request method.';
        return json_encode($this->response);
    }
}

$follow = new UpdateFollower();
echo $follow->changeFollower();
?>