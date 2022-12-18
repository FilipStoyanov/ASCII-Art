<?php
    class User {
        private $username;
        private $role;

        public function __construct($username, $role) {
            $this->username = $username;
            $this->role = $role;
        }

        public function getUsername () {
            return $this->username;
        }

        public function getRole () {
            return $this->role;
        }
    }
