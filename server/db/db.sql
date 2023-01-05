create database ascii_art;
use ascii_art;

create table if not exists user(
	id int primary key not null auto_increment,
    username varchar(255) unique not null,
    password_hash varchar(255) not null,
	roles enum("USER","ADMIN") not null default "USER",
    created_at datetime default current_timestamp,
    constraint USERNAME_LENGTH check(length(username) >= 3),
    unique index(username)
);

create table if not exists pictures(
	id int auto_increment,
    value longtext not null,
    color char(7) default "#000000",
    name varchar(255) not null,
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
    constraint PK_FRIEND primary key (id)
);