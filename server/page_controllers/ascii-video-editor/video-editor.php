<?php
include_once("../../db/db.php");
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

    public function add()
    {
        if ($_POST) {
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

    public function get_videos()
    {
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

            // $response['success'] = false;
            // $response['error_message'] = $e->getMessage();
            // return json_encode($response);  
            // echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Error with fetching ascii videos"]);

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
}