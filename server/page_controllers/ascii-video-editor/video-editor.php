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
        if (strlen($title) <= 0) {
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

                $query = $this->connection->insertNewAsciiVideo([
                    "title" => $title,
                    "owner_id" => $owner_id,
                    "color" => $color,
                    "background" => $background,
                    "time" => $time,
                    "frames" => $frames
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