<?php
include_once("../../db/db.php");
include_once("../../jwt/jwt.php");
class UserInfo
{

    private $connection;
    private $response;

    public function __construct()
    {
        $this->connection = new DatabaseConnection();
        $this->response = array();
    }

    public function getUserById()
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        if ($authHeader == null) {
            header('HTTP/1.0 401 Unauthorized');
            return json_encode(["success" => false, "error" => "No token"]);
        }
        $verifiedToken = JWT::verify($authHeader);
        if ($verifiedToken == null) {
            header('HTTP/1.0 401 Unauthorized');
            return json_encode(["success" => false, "error" => "Expired token"]);
        }
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $url = $_SERVER['REQUEST_URI'];
            $components = parse_url($url);
            parse_str($components['query'], $pathParameters);

            $jwtUser = JWT::fetchUserFromJWT($authHeader);
            $user = $jwtUser['id'];
            if ($user == null) {
                $this->response['success'] = false;
                $this->response['error'] = 'User is not chosen.';
                return json_encode($this->response);
            }

            if (!is_int($user)) {
                $user = (int) $user;
            }
            if ($user <= 0) {
                $this->response['success'] = false;
                $this->response['error'] = 'Invalid user id.';
                return json_encode($this->response);
            }
            try {
                $user = $this->connection->getUserById(['user'=>$user]);
            } catch (Exception $e) {
                $response['success'] = false;
                $response['error'] = $e->getMessage();
                return json_encode($response);
            }

            if(!$user){
                $response['success'] = false;
                $response['error'] = 'User with id '.$user.' was not found.';
                return json_encode($response);
            }

            $response['user'] = $this->dropSensitiveInformation($user);
            $response['success'] = true;
            return json_encode($response);
        }
        $this->response['status'] = 'fail';
        $this->response['error'] = 'WRONG HTTP Request method.';
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
$info = new UserInfo();
echo $info->getUserById();
