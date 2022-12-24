<?php
include_once("page_controllers/follow.php");  
$follow = new Follow();
echo $follow->addFollower();