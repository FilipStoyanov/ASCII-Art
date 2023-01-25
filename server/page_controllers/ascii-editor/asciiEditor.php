<?php
include_once("../../db/db.php");
include_once("../../jwt/jwt.php");
class AsciiEditor
{

    private $connection;
    private $errors;

    public function __construct()
    {
        $this->connection = new DatabaseConnection();
        $this->errors = array();
    }

    public function validateAsciiText($value, $name)
    {
        if (strlen($name) <= 0) {
            $this->errors['success'] = false;
        } else {
            $this->errors['success'] = true;
        }
    }

    public function add()
    {
        if ($_POST) {
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
            $data = json_decode($_POST['data'], true);
            $value = $data['value'];
            $name = $data['name'];
            $color = $data['color'];
            $owner_id = $data['owner_id'];

            $jwtUser = JWT::fetchUserFromJWT($authHeader);
            if ($jwtUser['id'] != $owner_id && $jwtUser['role'] != 'ADMIN') {
                header('HTTP/1.0 403 Forbidden');
                return json_encode(["success" => false, "error" => "You are not authorized to access this page"]);
            }
            //TODO: validate $color variable
            $this->validateAsciiText($value, $name);
            if ($this->errors['success']) {
                $query = $this->connection->insertNewAsciiText(["value" => json_encode($value), "name" => $name, "color" => $color, "owner_id" => $owner_id]);
                if ($query["success"]) {
                    echo json_encode(["success" => true, "data" => $data, "message" => "Successfully added ascii text", "token" => $verifiedToken]);
                } else {
                    if ($query["code"] == 1062) {
                        echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Ascii picture with this name already exists."]);
                    } else {
                        echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "User with this id is not found"]);
                    }
                }
            } else {
                echo json_encode($this->errors);
            }
        }
    }

    public function getAsciiPicturesForUser()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $url = $_SERVER['REQUEST_URI'];
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
            $components = parse_url($url);
            parse_str($components['query'], $pathParameters);
            if (!array_key_exists('user', $pathParameters) || $pathParameters['user'] == null) {
                echo json_encode(["success" => false]);
                return;
            }
            $user = $pathParameters['user'];
            if (!is_int($user)) {
                $user = (int) $user;
            }
            if ($user <= 0) {
                echo json_encode(["success" => false, "error" => "Invalid user id."]);
                return;
            }
            $jwtUser = JWT::fetchUserFromJWT($authHeader);
            if ($jwtUser['id'] != $user && $jwtUser['role'] != 'ADMIN') {
                header('HTTP/1.0 403 Forbidden');
                return json_encode(["success" => false, "error" => "You are not authorized to access this page"]);
            }
            try {
                $query = $this->connection->getAsciiPictures(['owner' => $user]);
                echo json_encode(["success" => true, $query['data'], "token" => $verifiedToken]);
            } catch (Exception $e) {
                echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Error with fetching ascii pictures"]);
            }
        }
    }

    public function getAsciiPictureForUser()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $url = $_SERVER['REQUEST_URI'];
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
            $components = parse_url($url);
            parse_str($components['query'], $pathParameters);
            if (
                !array_key_exists('user', $pathParameters) || $pathParameters['user'] == null ||
                !array_key_exists('name', $pathParameters) || $pathParameters['name'] == null
            ) {
                echo json_encode(["success" => false, "error" => "Invalid user id or ascii name "]);
                return;
            }
            $user = $pathParameters['user'];
            $asciiName = $pathParameters['name'];
            if (!is_int($user)) {
                $user = (int) $user;
            }
            if ($user <= 0) {
                echo json_encode(["success" => false, "error" => "Invalid user id."]);
                return;
            }
            $jwtUser = JWT::fetchUserFromJWT($authHeader);
            if ($jwtUser['id'] != $user && $jwtUser['role'] != 'ADMIN') {
                header('HTTP/1.0 403 Forbidden');
                return json_encode(["success" => false, "error" => "You are not authorized to access this page"]);
            }
            try {
                $picture = $this->connection->getAsciiPictureByName(["owner_id" => $user, "name" => $asciiName]);
                if ($picture["success"]) {
                    echo json_encode(["success" => true, $picture['data'], "token" => $verifiedToken]);
                }
            } catch (Exception $e) {
                $response['success'] = false;
                $response['error_message'] = $e->getMessage();
                echo json_encode($response);
                return;
            }
        }
    }

    public function updateAsciiPicture()
    {
        if ($_SERVER['REQUEST_METHOD'] == "PUT") {
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
            $data = (array) json_decode(file_get_contents('php://input'), true);
            $owner = $data['owner_id'];
            $color = $data['color'];
            $value = $data["value"];
            $asciiName = $data['name'];
            $previousName = $data['previous_name'];
            $user = JWT::fetchUserFromJWT($authHeader);
            if ($user['id'] != $owner && $user['role'] != 'ADMIN') {
                header('HTTP/1.0 403 Forbidden');
                return json_encode(["success" => false, "error" => "You are not authorized to access this page"]);
            }
            $query = $this->connection->updateAsciiPicture(["value" => $value, "color" => $color, "name" => $asciiName, "owner_id" => $owner, "previous_name" => $previousName]);
            if ($query["success"]) {
                echo json_encode(["success" => true, "token" => $verifiedToken]);
            } else {
                echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Error with deleting ascii picture with name: $previousName"]);
            }
        }
    }

    public function deleteAsciiPicture()
    {
        if ($_SERVER['REQUEST_METHOD'] == "DELETE") {
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
            $data = (array) json_decode(file_get_contents('php://input'), true);
            $owner = $data['owner_id'];
            $asciiName = $data['name'];
            $user = JWT::fetchUserFromJWT($authHeader);
            if ($user['id'] != $owner && $user['role'] != 'ADMIN') {
                header('HTTP/1.0 403 Forbidden');
                return json_encode(["success" => false, "error" => "You are not authorized to access this page"]);
            }
            $query = $this->connection->deleteAsciiPicture(["owner_id" => $owner, "name" => $asciiName]);
            if ($query["success"]) {
                echo json_encode(["success" => true, "token" => $verifiedToken]);
            } else {
                echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Error with deleting ascii picture with name: $asciiName"]);
            }
        }
    }

    public function getAll()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $url = $_SERVER['REQUEST_URI'];
            $components = parse_url($url);
            parse_str($components['query'], $pathParameters);
            if (
                !array_key_exists('user', $pathParameters) || $pathParameters['user'] == null
            ) {
                echo json_encode(["success" => false, "error" => "Invalid user id"]);
                return;
            }
            $user = $pathParameters['user'];
            if (!is_int($user)) {
                $user = (int) $user;
            }
            if ($user <= 0) {
                echo json_encode(["success" => false, "error" => "Invalid user id."]);
                return;
            }
            try {
                $picture = $this->connection->getAllAsciiPictures(["owner_id" => $user]);
                if ($picture["success"]) {
                    echo json_encode(["success" => true, $picture['data']]);
                    return;
                }
            } catch (Exception $e) {
                $response['success'] = false;
                $response['error_message'] = $e->getMessage();
                echo json_encode($response);
                return;
            }
        }
    }

    public function getUserPictures()
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
            if (
                !array_key_exists('owner', $pathParameters) || $pathParameters['owner'] == null
            ) {
                return json_encode(["success" => false, "error" => "Owner is not chosen."]);
            }
            if (!array_key_exists('page', $pathParameters) || $pathParameters['page'] == null) {
                $page = null;
                $limit = null;
            } else {
                $page = $pathParameters['page'];
                $limit = 10;
            }

            if (!is_int($page)) {
                $page = (int) $page;
            }
            $owner = $pathParameters['owner'];
            if (!is_int($user)) {
                $user = (int) $user;
            }
            if (!is_int($owner)) {
                $owner = (int) $owner;
            }
            if ($user <= 0 || $owner <= 0) {
                return json_encode(["success" => false, "error" => "Invalid user id."]);
            }
            try {
                $picture = $this->connection->getUserPictures(["owner" => $owner, "user" => $user, 'page' => $page, 'limit' => $limit]);
                return json_encode(["success" => true, 'pictures' => $picture,'token'=>$verifiedToken]);
            } catch (Exception $e) {
                $response['success'] = false;
                $response['error_message'] = $e->getMessage();
                return json_encode($response);
            }
        }
    }

    public function getAllFriendsPictures()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $url = $_SERVER['REQUEST_URI'];
            $components = parse_url($url);
            parse_str($components['query'], $pathParameters);

            $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
            if ($authHeader == null) {
                return json_encode(["success" => false, "error" => "No token"]);
            }
            $verifiedToken = JWT::verify($authHeader);
            if ($verifiedToken == null) {
                header('HTTP/1.0 401 Unauthorized');
                return json_encode(["success" => false, "error" => "Invalid token"]);
            }
            $jwtUser = JWT::fetchUserFromJWT($authHeader);
            $user = $jwtUser['id'];
            if ($user == null) {
                return json_encode(['success' => false, 'errors' => 'User is not chosen.']);
            }

            if (!array_key_exists('page', $pathParameters) || $pathParameters['page'] == null) {
                $page = null;
                $limit = null;
            } else {
                $page = $pathParameters['page'];
                $limit = 10;
            }

            if (!is_int($page)) {
                $page = (int) $page;
            }
            if (!is_int($user)) {
                $user = (int) $user;
            }
            if ($user <= 0) {
                return json_encode(["success" => false, "error" => "Invalid user id."]);
            }
            try {
                $picture = $this->connection->getAllFriendsPictures(["user" => $user, 'page' => $page, 'limit' => $limit]);
                return json_encode(["success" => true, 'pictures' => $picture,'token'=>$verifiedToken]);
            } catch (Exception $e) {
                $response['success'] = false;
                $response['error'] = $e->getMessage();
                return json_encode($response);
            }
        }
    }
}