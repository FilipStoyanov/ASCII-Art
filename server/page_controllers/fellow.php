<?php
include_once("../db/db.php");
// include_once("./db/db.php");
class Fellow
{

    private $response;

    public function __construct()
    {
        $this->response = array();
    }

    public function updateFollower($request_type, $update)
    {
        if ($_SERVER['REQUEST_METHOD'] == $request_type) {
            $data = (array) json_decode(file_get_contents('php://input'), JSON_UNESCAPED_UNICODE);
            if (!array_key_exists('follower', $data) || $data['follower'] == null) {
                $this->response['success'] = false;
                $this->response['error_message'] = 'Follower is not chosen.';
                return json_encode($this->response);
            }
            if (!array_key_exists('user', $data) || $data['user'] == null) {
                $this->response['success'] = false;
                $this->response['error_message'] = 'User is not chosen.';
                return json_encode($this->response);
            }

            $user = $data['user'];
            $follower = $data['follower'];
            if(!is_int($user)){
                $user = (int) $user;
            }
            if(!is_int($follower)){
                $follower = (int) $follower;
            }
            if ($user <= 0 || $follower <= 0) {
                $this->response['success'] = false;
                $this->response['error_message'] = 'Invalid ids.';
                return json_encode($this->response);
            }
            try {
                $update($user, $follower);
                $this->response['success'] = true;
                return json_encode($this->response);
            } catch (Exception $e) {
                $this->response['success'] = false;
                $this->response['error_message'] = $e->getMessage();
                return json_encode($this->response);
            }
        }
        $this->response['success'] = false;
        $this->response['error_message'] = 'WRONG HTTP Request method.';
        return json_encode($this->response);
    }

    public function getFellows($search,$search_key)
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $data = (array) json_decode(file_get_contents('php://input'), JSON_UNESCAPED_UNICODE);

            if (!array_key_exists('user', $data) || $data['user'] == null) {
                $this->response['success'] = false;
                $this->response['error_message'] = 'User is not chosen.';
                return json_encode($this->response);
            }

            if (!array_key_exists('page', $data) || $data['page'] == null || !is_int($data['page']) || $data['page']<=0) {
                $page = null;
                $limit = null;
            } else {
                $page = $data['page'];
                $limit = 20;
            }

            $user = $data['user'];
            if(!is_int($user)){
                $user = (int) $user;
            }
            if ($user <= 0) {
                $this->response['success'] = false;
                $this->response['error_message'] = 'Invalid user id.';
                return json_encode($this->response);
            }
            try {
                $fellows = $search($user, $page, $limit);
            } catch (Exception $e) {
                $this->response['success'] = false;
                $this->response['error_message'] = $e->getMessage();
                return json_encode($this->response);
            }
            $fellows = array_filter($fellows, function ($v) {
                return $v !=null;
            });
            for ($i = 0; $i < count($fellows); ++$i) {
                $fellows[$i] = $this->dropSensitiveInformation($fellows[$i]);
            }
            $this->response[$search_key] = $fellows;
            $this->response['success'] = true;
            return json_encode($this->response);
        }
        $this->response['success'] = false;
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
?>