create database ascii_art;

use ascii_art;

create table if not exists user(
    id int primary key not null auto_increment,
    username varchar(255) unique not null,
    password_hash varchar(255) not null,
    roles enum("USER", "ADMIN") not null default "USER",
    created_at datetime default current_timestamp,
    constraint USERNAME_LENGTH check(length(username) >= 3),
    unique index(username)
);

create table if not exists pictures(
    id int auto_increment,
    value longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci not null,
    color char(7) default "#000000",
    name varchar(255) not null,
    likes int unsigned not null default 0,
    owner_id int not null,
    created_at datetime default current_timestamp,
    updated_at datetime default current_timestamp,
    constraint PK_PICTURE primary key (id),
    constraint UQ_NAME unique(name, owner_id),
    constraint FK_OWNER foreign key (owner_id) references user(id) on delete cascade
);

create table if not exists follower(
    id int auto_increment,
    user int not null,
    follower int not null,
    constraint PK_FRIEND primary key (id),
    constraint FK_USER foreign key (user) references user(id) on delete cascade,
    constraint FK_FOLLOWER foreign key (follower) references user(id) on delete cascade
);

create table if not exists videos(
    id int auto_increment,
    title varchar(255) not null,
    owner_id int not null,
    time_delay int not null,
    color char(7) default "#ffffff",
    background char(7) default "#000000",
    frames longtext not null,
    created_at datetime default current_timestamp,
    updated_at datetime default current_timestamp,
    constraint PK_VIDEO primary key (id),
    constraint UQ_VIDEO_NAME unique(title, owner_id),
    constraint FK_VIDEO_OWNER foreign key (owner_id) references user(id) on delete cascade
);

create table if not exists liked(
    id int auto_increment,
    user int not null,
    picture int not null,
    constraint PK_LIKED primary key (id),
    constraint FK_USER_LIKED foreign key (user) references user(id) on delete cascade,
    constraint FK_PICTURE_LIKED foreign key (picture) references pictures(id) on delete cascade
);