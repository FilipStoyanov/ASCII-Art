<?php
header('Access-Control-Allow-Origin: *');
include_once(".\page_controllers\userInfo.php");  
// include_once("./page_controllers/updateFollower.php");  

$info = new UserInfo();
echo $info->getUserById();
?>