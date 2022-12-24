<?php
include_once("page_controllers/user.php");  
include_once("page_controllers/follow.php");  
$follow = new Follow();
echo $follow->getFollowings();