# kingdom-g

It is a browser turn-based strategy game for 2-4 players available at <https://gavr.games>. Below is the developer's guide to set up development environment.

Getting Started
---------------

The general idea is to have a set of containers with Lords services installed and working inside of it. Any developer will be able to quickly bring it up and test/develop.
We use Docker and Docker Compose to spin up our development environment.
You can [install Docker here](https://docs.docker.com/engine/installation/linux/ubuntu/)
You will also need to [install Docker Compose](https://docs.docker.com/compose/install/)

Pre Requirements
---------------

- Your machine should support virtualization. Sometimes you need to enable it in BIOS.
- OS: Ubuntu or MacOS.
- Installed Docker + Docker Compose.
- Internet connection :)

Next steps
---------------

Once you have all of those installed you should:
- Checkout latest Lords code from GitHub. You should see `docker-compose.yml` file in the root defining all services.
- cd to project's root folder and run `docker-compose build`. It will build all Dockerfiles and create images for containers.
- run `docker-compose up -d` to start all services.
- Now you should have a running set of docker containers. Check all of them are working using `docker-compose ps` command. The game should be available via https://kingdom-g.localhost

Everyday Usage
---------------
- to launch containers run `docker-compose up -d`
- to stop containers run `docker-compose stop`
- to run command inside running container `docker exec api COMMAND`
- to login into container `docker-compose exec api /bin/bash`
- to run command in separate container instance `docker-compose run --rm api COMMAND`
- to completely remove container `docker-compose kill api` + `docker-compose rm api` (it could be useful to recreate container when something went wrong).

You can change `api` to any container name, see `docker-compose.yml`.
Each container syncs required folders in both directions (see `docker-compose.yml` -> `volumes` sections).
