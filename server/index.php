<?php
include_once("page_controllers/user.php");  
$follow = new User();
echo $follow->getUserByName();