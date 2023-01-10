<?php
include_once("../../db/db.php");
class Users
{

    private $connection;
    private $response;

    public function __construct()
    {
        $this->connection = new DatabaseConnection();
        $this->response = array();
    }

    public function getAllUsers()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $url = $_SERVER['REQUEST_URI'];
            $components = parse_url($url);
            parse_str($components['query'], $pathParameters);

            if (!array_key_exists('user', $pathParameters) || $pathParameters['user'] == null) {
                $this->response['status'] = 'fail';
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

            $userId = $pathParameters['user'];
            if (!is_int($userId)) {
                $userId = (int) $userId;
            }

            try {
                $users = $this->connection->getAllFilteredUsers($userId,$page,$limit);
            } catch (Exception $e) {
                $response['success'] = false;
                $response['error_message'] = $e->getMessage();
                return json_encode($response);
            }

            if (!$users) {
                $response['success'] = false;
                $response['error_message'] = 'User with id ' . $userId . ' was not found.';
                return json_encode($response);
            }

            $users = array_values(array_filter($users, function ($v) {
                return $v != null;
            }));

            $users = array_map(function ($v) {
                return $this->dropSensitiveInformation($v);
            }, $users);
            $response['users'] = $users;
            $response['success'] = true;
            return json_encode($response);
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

$user = new Users();
echo $user->getAllUsers();
?>