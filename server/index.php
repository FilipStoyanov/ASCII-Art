<?php
header('Access-Control-Allow-Origin: *');
include_once(".\page_controllers\userInfo.php");  

$info = new UserInfo();
echo $info->getUserById();
?>