<?php

include_once("./video-editor.php");
$videoEditor = new AsciiVideoEditor();
echo $videoEditor->get_videos();

?>