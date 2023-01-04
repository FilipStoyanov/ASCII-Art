<?php
include_once("../../db/db.php");
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
            $data = json_decode($_POST['data'], true);
            $value = $data['value'];
            $name = $data['name'];
            $color = $data['color'];
            //TODO: validate $color variable
            $this->validateAsciiText($value, $name);
            if ($this->errors['success']) {
                $owner_id = 1; // TODO: get current user id
                $query = $this->connection->insertNewAsciiText(["value" => json_encode($value), "name" => $name, "color" => $color, "owner_id" => $owner_id]);
                if ($query["success"]) {
                    echo json_encode(["success" => true, "message" => "Successfully added ascii text"]);
                } else {
                    echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Ascii picture with this name already exists."]);
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
            $components = parse_url($url);
            parse_str($components['query'], $pathParameters);
            if (!array_key_exists('user', $pathParameters) || $pathParameters['user'] == null) {
                echo json_encode(["success" => false]);
            }
            $user = $pathParameters['user'];
            if (!is_int($user)) {
                $user = (int) $user;
            }
            if ($user <= 0) {
                echo json_encode(["success" => false, "error" => "Invalid user id."]);
            }
            try {
                $query = $this->connection->getAsciiPictures(['owner_id' => $user]);
                echo json_encode(["success" => true, $query['data']]);
            } catch (Exception $e) {
                echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Error with fetching ascii pictures"]);
            }
        }
    }

    public function getAsciiPictureForUser()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'GET') {
            $url = $_SERVER['REQUEST_URI'];
            $components = parse_url($url);
            parse_str($components['query'], $pathParameters);
            if (
                !array_key_exists('user', $pathParameters) || $pathParameters['user'] == null ||
                !array_key_exists('name', $pathParameters) || $pathParameters['name'] == null
            ) {
                echo json_encode(["success" => false]);
            }
            $user = $pathParameters['user'];
            $asciiName = $pathParameters['name'];
            if (!is_int($user)) {
                $user = (int) $user;
            }
            if ($user <= 0) {
                echo json_encode(["success" => false, "error" => "Invalid user id."]);
            }
            try {
                $picture = $this->connection->getAsciiPictureByName(["owner_id"  => $user, "name" => $asciiName]);
                if ($picture["success"]) {
                    echo json_encode(["success" => true, $picture['data']]);
                }
            } catch (Exception $e) {
                $response['success'] = false;
                $response['error_message'] = $e->getMessage();
                return json_encode($response);
            }
        }
    }

    public function updateAsciiPicture()
    {
        if ($_SERVER['REQUEST_METHOD'] == "PUT") {
            $data = (array) json_decode(file_get_contents('php://input'), true);
            $owner = $data['owner_id'];
            $color = $data['color'];
            $value = $data["value"];
            $asciiName = $data['name'];
            $previousName = $data['previous_name'];
            $query = $this->connection->updateAsciiPicture(["value" => $value, "color" => $color, "name" => $asciiName, "owner_id"  => $owner, "previous_name" => $previousName]);
            if ($query["success"]) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Error with deleting ascii picture with name: $previousName"]);
            }
        }
    }

    public function deleteAsciiPicture()
    {
        if ($_SERVER['REQUEST_METHOD'] == "DELETE") {
            $data = (array) json_decode(file_get_contents('php://input'), true);
            $owner = $data['owner_id'];
            $asciiName = $data['name'];
            $query = $this->connection->deleteAsciiPicture(["owner_id"  => $owner, "name" => $asciiName]);
            if ($query["success"]) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Error with deleting ascii picture with name: $asciiName"]);
            }
        }
    }
}
