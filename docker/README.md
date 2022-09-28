## Dockerized Workflow

The ultimate goal is to use Docker to create an environment that end to end testing can take place in. We needed a way for tests to be ran against a set of deployed contracts without worrying about any wallet integration. A local Hardhat node can be connected to via `ethers.providers.JsonRpcProvider` as a signer without having to confirm transactions through a wallet UI. Adding dockerized containers allows for these tests to run in a controlled environment and be ran using Github Actions during pull request creation and merging on Github.

### Blockchain

A pretty simply configured Hardhat node. Setup files are in the directory, `./docker/blockchain`:

- `.env.tests` example to keeps secrets, secret. This file will need to be manually created with the following variable
  ```shell
  ALCHEMY_API_KEY="Your Alchemy Key"
  ```
- `Dockerfile` see comments in file. Creation script for blockchain Docker container
- `entrypoint.sh` executes the package.json script to start.
- `hardhat.config.js` sets the hardhat node to specific chain id and runs node forked from goerli and lastest block
- `hardhat.package.json` with `hardhat` and `dotenv` libraries

### Webapp

Runs a dockerized version of `fractal-interface`. Setup files are in the directory, `./docker/webapp`:

- `Dockerfile` see comments in file. Creation script for webapp Docker container
- `entrypoint.sh` executes the package.json script to start.

### Playwright

Coming soon(Playwright docker)

## Usage

### Setup

1.) You'll need to a free Alchemy API key for a Goerli project from https://www.alchemy.com/.

Once obtained, create a `.env.tests.local` file in `./docker/` directory. Add your Alchemy API key to an env variable `ALCHEMY_API_KEY` as shown in `./docker/.env.tests`. see https://hardhat.org/hardhat-network/docs/guides/forking-other-networks for more information on forking.

2.) You'll also need to have the Docker software installed on your computer and running. See https://www.docker.com/

### Build

If files are changed, you should kill the instances and re-build and start again. `docker compose down` (if detached) or `crtl + c`

To build all containers:

```shell
$ docker compose build`
```

To build a single container

```shell
$ docker compose build <container-name>
```

### Run

To run all services

```shell
$ docker compose up
```

To run all services in detached mode

```shell
$ docker compose up -d
```

To target a specific container to run

```shell
$ docker compose up <container-name>
```

You can also add the `--build` flag to the up command to build before running

```shell
$ docker compose up --build
```

### Stop

To stop all services

```shell
$ crtl-c
```

To stop detached services

```shell
$ docker compose stop
```

### Help

To see a list of commands

```shell
$ docker compose
# or
$ docker compose COMMAND --help
```
