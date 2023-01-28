<?php
    $page_name = $_GET["name"];
    echo $page_name;
    switch ($page_name) {
        case "editor":
            $file_contents = file_get_contents('../frontend/html/editor.html');
            echo $file_contents;
            break;
        case "services":
            $file_contents = file_get_contents('services.html');
            echo $file_contents;
            break;
        case "contact":
            $file_contents = file_get_contents('contact.html');
            echo $file_contents;
            break;
        default:
            http_response_code(404);
            $file_contents = file_get_contents('notfound.html');
            echo $file_contents;
    }
?>




