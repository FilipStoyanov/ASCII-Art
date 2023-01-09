<?php
include_once("../../db/db.php");
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
            if (!is_int($user)) {
                $user = (int) $user;
            }
            if (!is_int($follower)) {
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

    public function getFellows($search, $search_key,$pathParameters)
    {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {

            if (!array_key_exists('user', $pathParameters) || $pathParameters['user'] == null) {
                $this->response['success'] = false;
                $this->response['error_message'] = 'User is not chosen.';
                return json_encode($this->response);
            }

            if (!array_key_exists('page', $pathParameters) || $pathParameters['page'] == null) {
                $page = null;
                $limit = null;
            } else {
                $page = $pathParameters['page'];
                $limit = 20;
            }

            if (!is_int($page)) {
                $page = (int) $page;
            }

            if ($page <= 0) {
                $this->response['success'] = false;
                $this->response['error_message'] = 'Invalid page.';
                return json_encode($this->response);
            }
            
            $user = $pathParameters['user'];
            if (!is_int($user)) {
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
            
            $fellows = array_values(array_filter($fellows, function ($v) {
                return $v != null;
            }));
            
            $fellows = array_map(function ($v) {
                return $this->dropSensitiveInformation($v); },$fellows);
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