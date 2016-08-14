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
