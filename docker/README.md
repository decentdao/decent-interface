## Dockerized Workflow

The Ultimate Goal with this docker container is to create an environment that end to end testing can take place in. We needed a way for tests to be run against a set of deployed contracts without worrying about any wallet integration. A local hardhat node can be connected to via `ethers.providers.JsonRpcProvider` as a signer without having to confirm transactions through a wallet UI. Adding dockerized containers allows for these tests to run in a controlled environment and be ran using github actions during pull request creation and merging on Github.

### blockchain
A pretty simply configured hardhat node. Included in the dictory `docker/blockchain`:

- `.env.example` that should be copied and renamed to a `.env.local` (keeps secrets, secret)
- `Dockerfile` see comments in file. Creation Script for blockchain docker container
- `entrypoint.sh` executes the package json script to start.
- `hardhat.config.js` sets the hardhat node to specific chain id and runs node forked from goerli and lastest block
- `hardhat.package.json` with `hardhat` and `dotenv` libraries

### webapp
- `Dockerfile` see comments in file. Creation Script for webapp docker container
- `entrypoint.sh` executes the package json script to start.
- `webapp.env`  this sets the local provider url and chain id in the docker container

### playwright
coming soon

## Usage

### Setup

You are gonna need to do is retreive a free alchemy api key from https://www.alchemy.com/. 

Once obtained, make a copy of the `docker/blockchain/.env.example` and name it `.env.local` and leave it in `docker/blockchain/` directory. Add your alchemy api key to the env variable `ALCHEMY_API_KEY`. see https://hardhat.org/hardhat-network/docs/guides/forking-other-networks.

### Build

If files are changed you should kill the instances and re-build and start again. `docker compose down` (if detached) or `crtl + c`

To build all container:
`docker compose build`

To build a single container
`docker compose build <container-name>`

### Run

To run all services
`docker compose up`

To run all services in detached mode
`docker compose up -d`

To target a specific container to run
`docker compose up <container-name>`

### Stop

To stop all services
`crtl-c`

To stop detached services
`docker compose stop`

### Help
To see a list of commands
`docker compose` or `docker compose COMMAND --help`