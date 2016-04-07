CREATE TABLE users(name TEXT NOT NULL,
                    username TEXT NOT NULL PRIMARY KEY,
                    email TEXT NOT NULL,
                    money INT NOT NULL,
                    birthdate DATE DEFAULT CURRENT_DATE);

CREATE TABLE streamers(name TEXT NOT NULL UNIQUE,
                        Channelname TEXT NOT NULL PRIMARY KEY,
                        online BOOL NOT NULL,
                        viewers INT NOT NULL,
                        preview TEXT NOT NULL,
                        creationdate DATE DEFAULT CURRENT_DATE);

CREATE TABLE summoners(name TEXT NOT NULL,
                        region TEXT NOT NULL,
                        summonerId TEXT NOT NULL,
                        streamer TEXT NOT NULL REFERENCES streamers(channelname),
                        PRIMARY KEY(region,summonerid));

CREATE TABLE games(gameId TEXT NOT NULL,
                    region TEXT NOT NULL,
                    streamer TEXT NOT NULL UNIQUE,
                    timestamp INT NOT NULL,
                    PRIMARY KEY(gameId,region),
                    FOREIGN KEY(streamer) REFERENCES streamers(channelname));

CREATE TABLE bannedchampions(gameid TEXT NOT NULL,
                            region TEXT NOT NULL,
                            name TEXT NOT NULL,
                            teamid TEXT NOT NULL,
                            PRIMARY KEY(gameid,region,name,teamid),
                            FOREIGN KEY(gameid,region) REFERENCES games(gameid,region));

CREATE TABLE players(gameid TEXT NOT NULL,
                    region TEXT NOT NULL,
                    summonername TEXT NOT NULL,
                    championname TEXT NOT NULL,
                    teamId TEXT NOT NULL,
                    summonerid TEXT NOT NULL,
                    spell1 TEXT NOT NULL,
                    spell2 TEXT NOT NULL,
                    rank TEXT NOT NULL,
                    finalMasteryId TEXT NOT NULL,
                    PRIMARY KEY(gameId,region,summonerid),
                    FOREIGN KEY(gameId,region) REFERENCES games(gameid,region));

CREATE TABLE bets(gameId TEXT NOT NULL,
                    region TEXT NOT NULL,
                    teamidwin TEXT NOT NULL,
                    amount INT NOT NULL,
                    users TEXT NOT NULL REFERENCES users(username),
                    PRIMARY KEY(gameid,region,users),
                    FOREIGN KEY(gameid,region) REFERENCES games(gameid,region));
