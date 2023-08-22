#### About

We think

###### Prerequisites

1.Node must be installed on machine.
2.Any Code editor like Vs code,webstrom etc should be installed on machine.
3.Postgres must be installed on machine.

Versions should be -
Node version - 12.19
npm version - 8.19.2
PostgreSQL version - 12.11

###### Steps to procceed

1. Clone the repo.
2. checkout to any branch you want to work on and take the latest code pull.
3. Install the dependencies(including ORM), which will be installed via the command- npm i

###### install Node.js

command- sudo apt install nodejs
check if installed by command - node -v

###### install npm (node package manager)

command- sudo apt install npm
check if installed by command- npm -v or npm –version

###### steps to use node version 12.19.2 via NVM(Node version manager)

1.curl <https://raw.githubusercontent.com/creationix/nvm/master/install.sh> | bash
2.source ~/.profile
3.nvm ls-remote
4.nvm install v12.19.2
5.nvm use v12.19.2

##### install postgres v12.11

1.sudo add-apt-repository "deb <http://apt.postgresql.org/pub/repos/apt/> xenial-pgdg main"
2.wget --quiet -O - <https://www.postgresql.org/media/keys/ACCC4CF8.asc> | sudo apt-key add -
3.sudo apt-get update
4.sudo apt-get install postgresql-12.11
5.sudo -iu postgres
6.psql
7.CREATE USER "your username" WITH PASSWORD 'your password';
8.ALTER USER "your user" WITH SUPERUSER;
9.CREATE DATABASE wethink_backend;
10.CREATE USER "any name" WITH PASSWORD 'any password';
11.GRANT ALL PRIVILEGES ON DATABASE wethink_backend to 'your created user for this database';

###### .env and .env.example file

make a .env file and .env.example for storing the keys related to the project.

###### Base url

host:/we-think-admin/v1/api/

###### Swagger Url
For API testing and using Swagger UI is used and link is-
host:/we-think-admin/v1/api-docs#

###### ORM
Sequelize Orm (postgres)
version 6.3.5

###### Important (Before Running Migrations)Login with master credentials and choose project database
Create Extension with command:-
GIN Index:-
create extension pg_trgm;

###### DataBase Migrations
1.Creation of migration file can be done by following command-
npx sequelize-cli migration:generate --name (your migration name)
and the migration file will be added into your migrations folder.

2.Add logic of your migartion to the migration file you created.(for ex. - creating table,adding column etc.)

3.Migraions can be run by running the following command-
npx sequelize-cli db:migrate

4.For undoing the migration run command-
npx sequelize-cli npx sequelize-cli db:migrate:undo

or undoing all migrations use-
npx sequelize-cli db:migrate:undo all

for more info on migrations refer to- <https://sequelize.org/master/manual/migrations.html>
