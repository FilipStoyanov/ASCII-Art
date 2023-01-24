<?php
include_once("../../db/db.php");
include_once("../../jwt/jwt.php");
class AsciiVideoEditor
{

    private $connection;
    private $errors;

    public function __construct()
    {
        $this->connection = new DatabaseConnection();
        $this->errors = array();
    }

    public function validateAsciiText($title)
    {
        if (mb_strlen($title) <= 0) {
            $this->errors['success'] = false;
        } else {
            $this->errors['success'] = true;
        }
    }

    public function validateAsciiFrames($frames)
    {
        for ($i = 0; $i < sizeof($frames); $i++) {
            if (mb_strlen($frames[$i]) > 0) {
                $this->errors['success'] = true;
            }
        }

        if ($this->errors["success"] != true) {
            $this->errors['success'] = false;
        }

    }

    public function add()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $data = json_decode($_POST['data'], true);
            $title = $data['title'];
            $time = $data['time'];
            $color = $data['color'];
            $background = $data['background'];
            $frames = $data['frames'];


            $this->validateAsciiText($title);

            if ($this->errors['success']) {
                $owner_id = 1;
                $serialized_frames = serialize($frames);

                $query = $this->connection->insertNewAsciiVideo([
                    "title" => $title,
                    "owner_id" => $owner_id,
                    "color" => $color,
                    "background" => $background,
                    "time" => $time,
                    "frames" => $serialized_frames
                ]);

                if ($query["success"]) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Video saved"
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "errors" => $query["error"],
                        "code" => $query["code"],
                        "message" => "Video with this name already exists."
                    ]);
                }
            } else {
                echo json_encode($this->errors);
            }
        }
    }


    public function update()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $data = json_decode($_POST['data'], true);
            $title = $data['title'];
            $time = $data['time'];
            $color = $data['color'];
            $background = $data['background'];
            $frames = $data['frames'];
            $id = $data["id"];
            $owner_id = $data["owner_id"];

            // var_dump($_POST);


            $this->validateAsciiText($title);
            $this->validateAsciiFrames($frames);

            if ($this->errors['success']) {
                $serialized_frames = serialize($frames);

                $query = $this->connection->updateAsciiVideo([
                    "title" => $title,
                    "color" => $color,
                    "background" => $background,
                    "time" => $time,
                    "frames" => $serialized_frames,
                    "owner_id" => $owner_id,
                    "id" => $id
                ]);

                if ($query["success"]) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Video saved"
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "errors" => $query["error"],
                        "code" => $query["code"],
                        "message" => "Video with this name already exists."
                    ]);
                }
            } else {
                echo json_encode($this->errors);
            }
        }
    }

    public function get_user_videos()
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

            if ($page <= 0) {
                return json_encode(["success" => false, "error" => "Invalid page."]);
            }

            if (!array_key_exists('owner_id', $pathParameters) || $pathParameters['owner_id'] == null) {
                return json_encode(["success" => false, "error" => "Invalid user id or ascii name "]);
            }

            $owner_id = $pathParameters['owner_id'];

            if (!is_int($owner_id)) {
                $owner_id = (int) $owner_id;
            }

            if ($owner_id <= 0) {
                return json_encode(["success" => false, "error" => "Invalid user id."]);
            }


            $query = $this->connection->getUserVideos(["owner_id" => $owner_id, "page" => $page, "limit" => $limit]);

            if ($query["success"]) {
                for ($i = 0; $i < count($query["data"]); $i++) {
                    $unserialised_frames = unserialize($query["data"][$i]["frames"]);
                    $query["data"][$i]["frames"] = $unserialised_frames;
                }

                return json_encode(['success'=>true,"data" => $query['data'],'token'=>JWT::generateToken($_SESSION['user'])]);
            }
            return json_encode([
                "success" => false,
                "errors" => $query["error"],
                "code" => $query["code"],
                "message" => "Could not load the videos."
            ]);


            // $response['success'] = false;
            // $response['error_message'] = $e->getMessage();
            // return json_encode($response);  
            // echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Error with fetching ascii videos"]);

        }
    }

    public function get_videos_feed()
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

            if ($page <= 0) {
                $this->response['success'] = false;
                $this->response['error'] = 'Invalid page.';
                return json_encode($this->response);
            }

            $user = $pathParameters['user'];
            if (!is_int($user)) {
                $user = (int) $user;
            }
            if ($user <= 0) {
                $this->response['success'] = false;
                $this->response['error'] = 'Invalid user id.';
                return json_encode($this->response);
            }

            try {
                $videos = $this->connection->getFriendsVideos(['user' => $user, 'page' => $page, 'limit' => $limit]);
                for ($i = 0; $i < count($videos); $i++) {
                    $unserialised_frames = unserialize($videos[$i]['data']["frames"]);
                    $videos[$i]['data']["frames"] = $unserialised_frames;
                }

                return json_encode(["success" => true, 'data' => $videos]);
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

    public function get_video()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $url = $_SERVER['REQUEST_URI'];
            $components = parse_url($url);
            parse_str($components['query'], $pathParameters);

            if (!array_key_exists('owner_id', $pathParameters) || $pathParameters['owner_id'] == null) {
                echo json_encode(["success" => false, "error" => "Invalid user id or ascii name "]);
            }

            $owner_id = $pathParameters['owner_id'];
            $id = $pathParameters["id"];

            if (!is_int($owner_id)) {
                $owner_id = (int) $owner_id;
            }

            if (!is_int($id)) {
                $id = (int) $id;
            }

            if ($owner_id <= 0) {
                echo json_encode(["success" => false, "error" => "Invalid user id."]);
            }

            if ($id <= 0) {
                echo json_encode(["success" => false, "error" => "Invalid video."]);
            }


            $query = $this->connection->getAsciiVideo(["owner_id" => $owner_id, "id" => $id]);

            if ($query["success"]) {
                $unserialised_frames = unserialize($query["data"][0]["frames"]);

                $query["data"][0]["frames"] = $unserialised_frames;
                // var_dump($query["data"][0]["frames"]);


                echo json_encode(["success" => true, "data" => $query['data']]);
            } else {
                echo json_encode([
                    "success" => false,
                    "errors" => $query["error"],
                    "code" => $query["code"],
                    "message" => "Could not load the video."
                ]);
            }

        }
    }

    public function get_videos()
    {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        if ($authHeader == null) {
            header('HTTP/1.0 401 Unauthorized');
            return json_encode(["success" => false, "error" => "No token"]);
        }
        $verifiedToken = JWT::verify($authHeader);
        if ($verifiedToken == null) {
            header('HTTP/1.0 403 Unauthorized');
            return json_encode(["success" => false, "error" => "Expired token"]);
        }
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $url = $_SERVER['REQUEST_URI'];
            $components = parse_url($url);
            parse_str($components['query'], $pathParameters);

            if (!array_key_exists('owner_id', $pathParameters) || $pathParameters['owner_id'] == null) {
                echo json_encode(["success" => false, "error" => "Invalid user id or ascii name "]);
            }

            $owner_id = $pathParameters['owner_id'];

            if (!is_int($owner_id)) {
                $owner_id = (int) $owner_id;
            }

            if ($owner_id <= 0) {
                echo json_encode(["success" => false, "error" => "Invalid user id."]);
            }


            $query = $this->connection->getAsciiVideos(["owner_id" => $owner_id]);

            if ($query["success"]) {
                for ($i = 0; $i < count($query["data"]); $i++) {
                    $unserialised_frames = unserialize($query["data"][$i]["frames"]);
                    $query["data"][$i]["frames"] = $unserialised_frames;
                }

                echo json_encode(["success" => true, "data" => $query['data']]);
            } else {
                echo json_encode([
                    "success" => false,
                    "errors" => $query["error"],
                    "code" => $query["code"],
                    "message" => "Could not load the videos."
                ]);
            }
        }
    }

    public function delete_video()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
            // $data = json_decode($_POST['data'], true);
            $data = (array) json_decode(file_get_contents('php://input'), true);
            $title = $data['title'];
            $owner_id = $data['owner_id'];


            $this->validateAsciiText($title);

            if ($this->errors['success']) {

                $query = $this->connection->deleteAsciiVideo([
                    "title" => $title,
                    "owner_id" => $owner_id
                ]);

                if ($query["success"]) {
                    echo json_encode([
                        "success" => true,
                        "message" => "Video deleted"
                    ]);
                } else {
                    echo json_encode([
                        "success" => false,
                        "errors" => $query["error"],
                        "code" => $query["code"],
                        "message" => "Failed to delete video."
                    ]);
                }
            } else {
                echo json_encode($this->errors);
            }
        }


    }
}


// public function getAsciiPicturesForUser()
// {
//     if ($_POST) {
//         $data = json_decode($_POST['data'], true);
//         $owner = $data['owner_id'];
//         $query = $this->connection->getAsciiPictures(["owner_id" => $owner]);
//         if ($query["success"]) {
//             echo json_encode(["success" => true, $query['data']]);
//         } else {
//             echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Error with fetching ascii pictures"]);
//         }
//     }
// }