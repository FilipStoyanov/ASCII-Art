<?php
include_once("./db/db.php");
class User
{

    private $connection;
    private $response;

    public function __construct()
    {
        $this->connection = new DatabaseConnection();
        $this->response = array();
    }

    public function getUserByName()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $data = (array) json_decode(file_get_contents('php://input'), JSON_UNESCAPED_UNICODE);

            if (!array_key_exists('user', $data) || $data['user'] == null) {
                $this->response['status'] = 'fail';
                $this->response['error_message'] = 'User is not chosen.';
                return json_encode($this->response);
            }

            $username = $data['user'];
            if (!is_string($username)) {
                $this->response['status'] = 'fail';
                $this->response['error_message'] = 'Invalid user name.';
                return json_encode($this->response);
            }

            try {
                $user = $this->connection->getUserByName($username);
            } catch (Exception $e) {
                $response['success'] = false;
                $response['error_message'] = $e->getMessage();
                return json_encode($response);
            }

            if(!$user){
                $response['success'] = false;
                $response['error_message'] = 'User with name '.$username.' was not found.';
                return json_encode($response);
            }

            $response['user'] = $this->dropSensitiveInformation($user);
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