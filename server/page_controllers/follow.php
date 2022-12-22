<?php
include_once("./db/db.php");
class Follow
{

    private $connection;
    private $response;

    public function __construct()
    {
        $this->connection = new DatabaseConnection();
        $this->response = array();
    }

    // private function validateLoginForm($username, $password) {
    //     $isValidUsername = (mb_strlen($username) >= 3);
    //     $isValidPassword = (mb_strlen($password) >= 6);
    //     if($isValidUsername && $isValidPassword) {
    //         $this->errors['success'] = true;
    //     } else {
    //         $this->errors['success'] = false;
    //     }
    // }

    public function addFollower()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $data = (array) json_decode(file_get_contents('php://input'), JSON_UNESCAPED_UNICODE);
           if (!array_key_exists('follower',$data) || $data['follower']==null) {
                $this->response['status'] = 'fail';
                $this->response['error_message'] = 'Follower is not chosen.';
                return json_encode($this->response);
            }
            if (!array_key_exists('user',$data) || $data['user']==null) {
                $this->response['status'] = 'fail';
                $this->response['error_message'] = 'User is not chosen.';
                return json_encode($this->response);
            }
            # TODO check type
            $user = $data['user'];
            $follower = $data['follower'];

            return $this->connection->insertNewFollower(["user" => $user, "follower" => $follower]);
        }
        $this->response['status'] = 'fail';
        $this->response['error_message'] = 'WRONG HTTP Request method.';
        return json_encode($this->response);

    }

    public function getFollowers()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $data = (array) json_decode(file_get_contents('php://input'), JSON_UNESCAPED_UNICODE);
        //    if (!array_key_exists('follower',$data) || $data['follower']==null) {
        //         $this->response['status'] = 'fail';
        //         $this->response['error_message'] = 'Follower is not chosen.';
        //         return json_encode($this->response);
        //     }
            if (!array_key_exists('user',$data) || $data['user']==null) {
                $this->response['status'] = 'fail';
                $this->response['error_message'] = 'User is not chosen.';
                return json_encode($this->response);
            }
            # TODO check type
            $user = $data['user'];
            // $follower = $data['follower'];
            return $this->connection->getFollowers(["user" => $user]);
        }
        $this->response['status'] = 'fail';
        $this->response['error_message'] = 'WRONG HTTP Request method.';
        return json_encode($this->response);

    }

}
$follow = new Follow();
$follow->addFollower();