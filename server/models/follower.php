<?php
    class Follower {
        private $id;
        private $user;
        private $follower;

        public function __construct($id, $user,$follower) {
            $this->id = $id;
            $this->user = $user;
            $this->follower = $follower;
        }

        public function getId () {
            return $this->id;
        }

        public function getUser () {
            return $this->user;
        }
        public function getFollower () {
            return $this->follower;
        }
    }
