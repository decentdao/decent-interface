# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Deployment Notes

Both the "dev" and "prod" environments of this app are currently deployed via both Netlify and IPFS (see the Github workflow files).

The "dev" environment tracks the `develop` branch, and the "prod" environment tracks the `master` branch.

On both hosting platforms, both the "dev" and "prod" environments are where custom environment variables are configured. For Netlify, it's in the site's build settings in the Netlify project. For the IPFS build, it's in Github's "secrets", and exposed to the build scripts in `.github/workflows/release-ipfs-[dev|prod].yaml`.

So at any given time, there are effectively four builds out there, and they are publicly accessible and privately configurable as follows:

1. dev site via Netlify
    - url: https://app.dev.fractalframework.xyz
    - env vars
      - netlify: https://app.netlify.com/sites/fractal-framework-interface-dev/settings/deploys#environment
1. dev site via IPFS
    - url: http://app.dev.fractalframework.xyz.ipns.localhost:8080/
    - env vars
      - github: https://github.com/decent-dao/fractal-interface/settings/environments/486034480/edit
      - workflow: [./.github/workflows/release-ipfs-dev.yaml](./.github/workflows/release-ipfs-dev.yaml)
1. prod site via Netlify
    - url: https://app.fractalframework.xyz
    - env vars
      - netlify: https://app.netlify.com/sites/fractal-framework-interface/settings/deploys#environment
1. prod site via IPFS
    - url: http://app.fractalframework.xyz.ipns.localhost:8080/
    - env vars
      - github: https://github.com/decent-dao/fractal-interface/settings/environments/503834178/edit
      - workflow: [./.github/workflows/release-ipfs-prod.yaml](./.github/workflows/release-ipfs-prod).

*TL;DR: When making changes to either "dev" or "prod" configurations, perform updates both on Netlify and in Github Secrets / Workflow*

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
