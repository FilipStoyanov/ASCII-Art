use ascii_art;
DELIMITER $$
CREATE PROCEDURE SEED_USERS()
BEGIN

	declare username_cnt INT;
    declare cnt INT;
    declare username VARCHAR(255);

    SET cnt = 1;
    SET username_cnt = 1;

	INSERT INTO
        user (username, password_hash, roles)
        VALUES ("filip", "7c4a8d09ca3762af61e59520943dc26494f8941b", "ADMIN");

	loop_label:  LOOP
		IF  cnt > 20 THEN
			LEAVE  loop_label;
		END  IF;
        SET username = ELT(username_cnt, "ivan",
											"peter",
											"dragan",
											"todor",
											"ivan12",
											"george",
											"filip1",
											"maria",
											"petya",
											"yordan",
											"petyo",
											"yordan2000",
											"stefan1902",
											"radina",
											"daniela",
											"krasimir",
											"daniela1",
											"lubomir0403",
											"miroslav",
											"nikolay"
										);

        INSERT INTO
        	user (username, password_hash, roles)
        	VALUES (username, "7c4a8d09ca3762af61e59520943dc26494f8941b", "USER");

		SET  username_cnt = username_cnt + 1;
        SET  cnt=cnt+1;

	END LOOP;
END$$

CALL SEED_USERS();