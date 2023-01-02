<?php
header('Access-Control-Allow-Origin: *');
include_once(".\page_controllers\listFollowers.php");  
// include_once("./page_controllers/updateFollower.php");  

$follow = new Follower();
echo $follow->getFollowers();
?>