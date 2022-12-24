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

    public function addFollower()
    {
        $addFollower = function ($user, $follower) {
            return $this->connection->insertNewFollower($user, $follower);
        };
        return $this->updateFollower('POST', $addFollower);
    }



    public function removeFollower()
    {
        $deleteFollower = function ($user, $follower) {
            return $this->connection->deleteFollower($user, $follower);
        };
        return $this->updateFollower('DELETE', $deleteFollower);
    }

    private function updateFollower($request_type, $update)
    {
        if ($_SERVER['REQUEST_METHOD'] == $request_type) {
            $data = (array) json_decode(file_get_contents('php://input'), JSON_UNESCAPED_UNICODE);
            if (!array_key_exists('follower', $data) || $data['follower'] == null) {
                $this->response['status'] = 'fail';
                $this->response['error_message'] = 'Follower is not chosen.';
                return json_encode($this->response);
            }
            if (!array_key_exists('user', $data) || $data['user'] == null) {
                $this->response['status'] = 'fail';
                $this->response['error_message'] = 'User is not chosen.';
                return json_encode($this->response);
            }

            $user = $data['user'];
            $follower = $data['follower'];
            if (!is_int($user) || !is_int($follower) || $user <= 0 || $follower <= 0) {
                $this->response['status'] = 'fail';
                $this->response['error_message'] = 'Invalid ids.';
                return json_encode($this->response);
            }
            try {
                $update($user, $follower);
                $response['success'] = true;
                return json_encode($response);
            } catch (Exception $e) {
                $response['success'] = false;
                return json_encode($response);
            }
        }
        $this->response['status'] = 'fail';
        $this->response['error_message'] = 'WRONG HTTP Request method.';
        return json_encode($this->response);
    }


    public function getFollowers()
    {
        return $this->getFellows(function ($user) {
            return $this->connection->getFollowers($user); });
    }


    public function getFollowings()
    {
        return $this->getFellows(function ($user) {
            return $this->connection->getFollowings($user); });
    }

    private function getFellows($search)
    {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $data = (array) json_decode(file_get_contents('php://input'), JSON_UNESCAPED_UNICODE);

            if (!array_key_exists('user', $data) || $data['user'] == null) {
                $this->response['status'] = 'fail';
                $this->response['error_message'] = 'User is not chosen.';
                return json_encode($this->response);
            }

            $user = $data['user'];
            if (!is_int($user) || $user <= 0) {
                $this->response['status'] = 'fail';
                $this->response['error_message'] = 'Invalid user id.';
                return json_encode($this->response);
            }

            try {
                $followers = $search($user);
            } catch (Exception $e) {
                $response['success'] = false;
                $response['error_message'] = $e->getMessage();
                return json_encode($response);
            }
            for ($i = 0; $i < count($followers); ++$i) {
                $followers[$i] = $this->dropSensitiveInformation($followers[$i]);
            }
            $response['followers'] = $followers;
            $response['success'] = true;
            return json_encode($response);
        }
        $this->response['status'] = 'fail';
        $this->response['error_message'] = 'WRONG HTTP Request method.';
        return json_encode($this->response);
    }

    private function dropSensitiveInformation($user)
    {
        unset($user['password_hash']);
        unset($user['roles']);
        unset($user['created_at']);
        for ($i = 0; $i < 5; ++$i) {
            unset($user[(string) $i]);
        }
        return $user;
    }

}
