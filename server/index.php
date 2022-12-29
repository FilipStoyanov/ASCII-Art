<?php
header('Access-Control-Allow-Origin: *');
include_once("page_controllers/user.php");  
// include_once("page_controllers/follow.php");  
$user = new User();
echo $user->getUserByName();
?>