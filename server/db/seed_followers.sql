use ascii_art;
DELIMITER $$
CREATE PROCEDURE SEED_FOLLOWERS()
BEGIN

    declare cnt INT;
    declare follower_cnt INT;

    SET cnt = 1;

	loop_label:  LOOP
		IF  cnt > 20 THEN
			LEAVE  loop_label;
		END  IF;

        SET follower_cnt = cnt + 1;
        follower_loop_label: LOOP
            IF  follower_cnt > 20 THEN
                LEAVE follower_loop_label;
            END  IF;

            INSERT INTO
            follower (user, follower)
            VALUES (cnt, follower_cnt);

		    SET  follower_cnt = follower_cnt + 1;

        END LOOP;

        SET  cnt=cnt+1;

	END LOOP;
END$$

CALL SEED_FOLLOWERS();