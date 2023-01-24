<?php
include_once("../../db/db.php");
include_once("../../jwt/jwt.php");
class Likes
{

    private $connection;
    private $response;

    public function __construct()
    {
        $this->connection = new DatabaseConnection();
        $this->response = array();
    }
    private function addLike()
    {
        $addLike = function ($user, $picture) {
            $this->connection->addLike(["user" => $user, "picture" => $picture]);
            $this->connection->updateLikesCount(['difference' => 1, "picture" => $picture]);
        };
        return $this->updateLikes('POST', $addLike);
    }

    public function updateLikes($request_type, $update)
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
        if ($_SERVER['REQUEST_METHOD'] == $request_type) {
            $data = (array) json_decode(file_get_contents('php://input'), JSON_UNESCAPED_UNICODE);
            if (!array_key_exists('picture', $data) || $data['picture'] == null) {
                $this->response['success'] = false;
                $this->response['error'] = 'Picture is not chosen.';
                return json_encode($this->response);
            }
            $jwtUser = JWT::fetchUserFromJWT($authHeader);
            $user = $jwtUser['id'];
            if ($user == null) {
                $this->response['success'] = false;
                $this->response['error'] = 'User is not chosen.';
                return json_encode($this->response);
            }
            $picture = $data['picture'];
            if (!is_int($user)) {
                $user = (int) $user;
            }
            if (!is_int($picture)) {
                $picture = (int) $picture;
            }
            if ($user <= 0 || $picture <= 0) {
                $this->response['success'] = false;
                $this->response['error'] = 'Invalid ids.';
                return json_encode($this->response);
            }
            try {
                $update($user, $picture);
                return json_encode(['success'=>true,'token'=>JWT::generateToken($_SESSION['user'])]);
            } catch (Exception $e) {
                $this->response['success'] = false;
                $this->response['error'] = $e->getMessage();
                return json_encode($this->response);
            }
        }
        $this->response['success'] = false;
        $this->response['error'] = 'WRONG HTTP Request method.';
        return json_encode($this->response);
    }

    private function removeLike()
    {
        $deleteLike = function ($user, $picture) {
            $this->connection->deleteLike(["user" => $user, "picture" => $picture]);
            $this->connection->updateLikesCount(['difference' => -1, "picture" => $picture]);
        };
        return $this->updateLikes('DELETE', $deleteLike);
    }

    private function getLikesCount()
    {
        $url = $_SERVER['REQUEST_URI'];
        $components = parse_url($url);
        parse_str($components['query'], $pathParameters);
        if (!array_key_exists('picture', $pathParameters) || $pathParameters['picture'] == null) {
            $this->response['success'] = false;
            $this->response['error'] = 'Picture is not chosen.';
            return json_encode($this->response);
        }
        $picture = $pathParameters['picture'];

        if (!is_int($picture)) {
            $picture = (int) $picture;
        }
        try {
            $likesCount = $this->connection->getLikesCount(['picture' => $picture]);
            $this->response['success'] = true;
            $this->response['likes'] = $likesCount;
            return json_encode($this->response);
        } catch (Exception $e) {
            $this->response['success'] = false;
            $this->response['error'] = $e->getMessage();
            return json_encode($this->response);
        }
    }

    public function likes()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            return $this->addLike();
        }
        if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
            return $this->removeLike();
        }
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            return $this->getLikesCount();
        }
        $this->response['success'] = false;
        $this->response['error'] = 'WRONG HTTP Request method.';
        return json_encode($this->response);
    }
}

$likes = new Likes();
echo $likes->likes();
?>