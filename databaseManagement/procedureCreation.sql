CREATE OR REPLACE FUNCTION UPDATE_STREAMER_DATABASE (text[][]) RETURNS void as $$
	DECLARE
    streamer text[];
    result text;
	BEGIN

    FOREACH streamer SLICE 1 IN ARRAY $1
    LOOP

        SELECT * FROM streamers WHERE channelName = streamer[1] INTO result;
        IF NOT FOUND THEN
          INSERT INTO streamers (name,channelName,online,viewers,preview,valid)
             VALUES (streamer[1], streamer[1], true ,cast(streamer[2] as integer),streamer[3],true);
        END IF;

        END LOOP;




	END;
$$ LANGUAGE plpgsql;

/*
 * Add a vote in the databse and update it if necessary
 */
CREATE OR REPLACE FUNCTION VOTE_SUMMONER (inusers TEXT , instreamer TEXT, insummonerID TEXT, inregion TEXT, invote INT) RETURNS void as $$
	DECLARE
		newvote int;
		result int;
	BEGIN

		--Set vote
		IF invote > 0 THEN
			newvote := 1;
		ELSE
			newvote := -1;
		END IF;

		--Check if entry already exist
		SELECT UVS.vote FROM USER_VOTE_SUMMONERS AS UVS WHERE UVS.users = inusers AND UVS.streamer = instreamer AND UVS.summonerid = insummonerID AND UVS.region = inregion INTO result;
		IF NOT FOUND THEN
			--Add the entry in the dabase
			INSERT INTO USER_VOTE_SUMMONERS
			VALUES (inusers, instreamer, insummonerID, inregion, newvote);

			--Update the score
			UPDATE PENDINGSUMMONERS SET score = score + newvote
			WHERE streamer=instreamer
				AND summonerid=insummonerid
				AND region=inregion;

		ELSE
			IF result <> newvote THEN
				--Update the entry in the database
				UPDATE USER_VOTE_SUMMONERS AS UVS SET vote = newvote
				WHERE UVS.users = inusers AND UVS.streamer = instreamer AND UVS.summonerid = insummonerID AND UVS.region = inregion;

				--Update the score
				UPDATE PENDINGSUMMONERS SET score = score + newvote + newvote
				WHERE streamer=instreamer
					AND summonerid=insummonerid
					AND region=inregion;
			ELSE
				--Throw error can't vote twice
				RAISE EXCEPTION 'You cant vote twice';
			END IF;
		END IF;

	END;
$$ LANGUAGE plpgsql;
