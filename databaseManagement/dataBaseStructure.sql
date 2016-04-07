CREATE TABLE users(name TEXT NOT NULL,
                    username TEXT NOT NULL PRIMARY KEY,
                    email TEXT NOT NULL,
                    money INT NOT NULL,
                    birth_date DATE DEFAULT CURRENT_DATE);

CREATE TABLE streamers(name TEXT NOT NULL UNIQUE,
                        ChannelName TEXT NOT NULL PRIMARY KEY,
                        online BOOL NOT NULL,
                        viewers INT NOT NULL,
                        preview TEXT NOT NULL,
                        creationDate DATE DEFAULT CURRENT_DATE);

CREATE TABLE summoners(name TEXT NOT NULL,
                        region TEXT NOT NULL,
                        summonerId TEXT NOT NULL,
                        streamer TEXT NOT NULL REFERENCES streamers(ChannelName),
                        PRIMARY KEY(region,summonerId));

CREATE TABLE games(gameId TEXT NOT NULL,
                    region TEXT NOT NULL,
                    summonerId TEXT NOT NULL,
                    timestamp INT NOT NULL,
                    PRIMARY KEY(region,gameId),
                    FOREIGN KEY(gameId,region) REFERENCES summoners(summonerId,region));

CREATE TABLE bannedchampions(gameId TEXT NOT NULL,
                            region TEXT NOT NULL,
                            name TEXT NOT NULL,
                            teamId TEXT NOT NULL,
                            PRIMARY KEY(gameId,region,name,teamId),
                            FOREIGN KEY(gameId,region) REFERENCES games(gameId,region));

CREATE TABLE players(gameId TEXT NOT NULL,
                    region TEXT NOT NULL,
                    summonerName TEXT NOT NULL,
                    championName TEXT NOT NULL,
                    teamId TEXT NOT NULL,
                    summonerId TEXT NOT NULL,
                    spell1 TEXT NOT NULL,
                    spell2 TEXT NOT NULL,
                    rank TEXT NOT NULL,
                    finalMasteryId TEXT NOT NULL,
                    PRIMARY KEY(gameId,region,summonerId),
                    FOREIGN KEY(gameId,region) REFERENCES games(gameId,region));

CREATE TABLE bets(gameId TEXT NOT NULL,
                    region TEXT NOT NULL,
                    teamIdWin TEXT NOT NULL,
                    amount INT NOT NULL,
                    users TEXT NOT NULL REFERENCES users(username),
                    PRIMARY KEY(gameId,region,users),
                    FOREIGN KEY(gameId,region) REFERENCES games(gameId,region));
