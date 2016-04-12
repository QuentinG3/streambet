CREATE TABLE users(name TEXT NOT NULL,
                    username TEXT NOT NULL PRIMARY KEY,
                    password TEXT NOT NULL,
                    email TEXT NOT NULL UNIQUE,
                    money INT NOT NULL,
                    birthdate DATE DEFAULT CURRENT_DATE,
                    CHECK (money>=0));

CREATE TABLE streamers(name TEXT NOT NULL UNIQUE,
                        channelname TEXT NOT NULL PRIMARY KEY,
                        online BOOL NOT NULL,
                        viewers INT NOT NULL,
                        preview TEXT NOT NULL,
                        valid BOOL NOT NULL,
                        creationdate DATE DEFAULT CURRENT_DATE);

CREATE TABLE summoners(summonersname TEXT NOT NULL,
                        region TEXT NOT NULL,
                        summonerid TEXT NOT NULL,
                        streamer TEXT NOT NULL REFERENCES streamers(channelname),
                        valid BOOL NOT NULL,
                        PRIMARY KEY(region,summonerid));

CREATE TABLE games(gameid TEXT NOT NULL,
                    region TEXT NOT NULL,
                    streamer TEXT NOT NULL UNIQUE,
                    summonerid TEXT NOT NULL,
                    summonerteam TEXT NOT NULL,
                    timestamp BIGINT NOT NULL,
                    PRIMARY KEY(gameid,region,streamer),
                    FOREIGN KEY(streamer) REFERENCES streamers(channelname),
                    FOREIGN KEY(summonerid,region) REFERENCES summoners(summonerid,region));

CREATE TABLE bannedchampions(gameid TEXT NOT NULL,
                            region TEXT NOT NULL,
                            name TEXT NOT NULL,
                            teamid TEXT NOT NULL,
                            streamer TEXT NOT NULL,
                            PRIMARY KEY(gameid,region,name,teamid,streamer),
                            FOREIGN KEY(gameid,region,streamer) REFERENCES games(gameid,region,streamer));

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
                    streamer TEXT NOT NULL,
                    PRIMARY KEY(gameId,region,summonerid,streamer),
                    FOREIGN KEY(gameId,region,streamer) REFERENCES games(gameid,region,streamer));

CREATE TABLE bets(gameId TEXT NOT NULL,
                    region TEXT NOT NULL,
                    teamidwin TEXT NOT NULL,
                    amount INT NOT NULL,
                    users TEXT NOT NULL REFERENCES users(username),
                    streamer TEXT NOT NULL,
                    PRIMARY KEY(gameid,region,users,streamer),
                    FOREIGN KEY(gameid,region,streamer) REFERENCES games(gameid,region,streamer));

CREATE TABLE user_vote_streamers(users TEXT NOT NULL REFERENCES users(username),
                                streamer TEXT NOT NULL REFERENCES streamers(channelname),
                                vote BOOL NOT NULL,
                                PRIMARY KEY(users,streamer));

CREATE TABLE user_vote_summoners(users TEXT NOT NULL REFERENCES users(username),
                                summonerid TEXT NOT NULL,
                                region TEXT NOT NULL,
                                vote BOOL NOT NULL,
                                PRIMARY KEY(users,summonerid,region),
                                FOREIGN KEY(summonerid,region) REFERENCES summoners(summonerid,region));
