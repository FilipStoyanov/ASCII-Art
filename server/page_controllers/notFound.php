<?php
    http_response_code(404);
    $file_contents = file_get_contents('not-found.html');
    echo $file_contents;
?>