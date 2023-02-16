# App Hosting on IPFS

## Setup
Fractal's app hosting on IPFS consists of the following setup pieces:

- `PINATA_API_KEY` and `PINATA_API_SECRET_KEY` repository secrets for a https://www.pinata.cloud/ account. A free account is limited to only 100 pinned files, so a paid account is necessary.
- `PINATA_PIN_NAME` environment secrets for both the dev and prod apps. This string is arbitrary, and appears within the Pinata account to reference the app.
- The Github workflow files `release-ipfs-dev.yaml` and `release-ipfs-prod.yaml` which trigger an upload and pinning of the static app files, which trigger on each push to the `develop` or `master` branches, respectively.
- A [DNSLink](https://dnslink.dev/) set within Cloudflare that redirects a user running an IPFS node (see below) to the IPFS hosted version of the app.

Additionally, customized setup pieces are referenced within the workflow yaml files:

- [ipfs-pinata-deploy-action](https://github.com/decent-dao/ipfs-pinata-deploy-action) - A Github action for deploying to IPFS through Pinata
- [convert-cidv0-cidv1](https://github.com/decent-dao/convert-cidv0-cidv1) - A GitHub action for converting a CIDv0 (IPFS hash) value to CIDv1

## Running an IPFS Node
In order to view the IPFS hosted version of the app you will need an IPFS node running on your machine as well as the IPFS browser plugin:

- [IPFS Desktop app](https://docs.ipfs.tech/install/ipfs-desktop/) - for running a node
- [IPFS Browser plugin](https://chrome.google.com/webstore/detail/ipfs-companion/nibjojkomfdiaoajekhjakgkdhaomnch) - Chrome plugin (other browsers also supported)

Now, when navigating to e.g. https://app.dev.fractalframework.xyz/ you should see the URL redirect to https://app.dev.fractalframework.xyz.ipns.localhost:8080/, and you are now viewing the IPFS hosted version. This make take some time on first viewing the site, as the files are all downloaded to your IPFS node.