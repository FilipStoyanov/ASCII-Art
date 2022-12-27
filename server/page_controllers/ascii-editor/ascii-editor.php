<?php
    include_once("../../db/db.php");    
    class AsciiEditor {

        private $connection;
        private $errors;

        public function __construct()
        {
            $this->connection = new DatabaseConnection();
            $this->errors = array();
        }

        public function validateAsciiText($value, $name) {
            if(strlen($name) <= 0) {
                $this->errors['success'] = false;
            } else {
                $this->errors['success'] = true;
            }
        }

        public function add()
        {
            if($_POST) {
                $data = json_decode($_POST['data'], true);
                $value = $data['value'];
                $name = $data['name'];
                $color = $data['color'];
                //TODO: need to validate $color variable
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

        public function getAsciiPicturesForUser() {
            if($_POST) {
                $data = json_decode($_POST['data'], true);
                $owner = $data['owner_id'];
                $query = $this->connection->getAsciiPictures(["owner_id"  => $owner]);
                if($query["success"]) {
                    echo json_encode(["success" => true, $query['data']]);
                } else {
                    echo json_encode(["success" => false, "errors" => $query["error"], "code" => $query["code"], "message" => "Error with fetching ascii pictures"]);
                }
             }
        }
    }
