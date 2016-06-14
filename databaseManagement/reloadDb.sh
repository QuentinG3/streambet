#!/bin/bash

psql -d streambet -a -f ./databaseManagement/dataBaseDrop.sql
psql -d streambet -a -f ./databaseManagement/dataBaseStructure.sql
psql -d streambet -a -f ./databaseManagement/insertStreamer.sql
psql -d streambet -a -f ./databaseManagement/insertRegion.sql
psql -d streambet -a -f ./databaseManagement/createUsers.sql
