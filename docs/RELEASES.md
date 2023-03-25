# Fractal Release Cycle
This document details the release cycle process followed by the Fractal frontend engineering team.

## Development environments
Fractal has three application environments:

- [Development (dev)](https://app.dev.fractalframework.xyz/) - for daily coding PRs and immediate deployment upon a code merge.
- [Staging](https://app.staging.fractalframework.xyz/) - a more stable environment for QA engineer testing and demoing upcoming features. 
- [Production (prod)](https://app.fractalframework.xyz/) - The user facing application, which requires a version tag to publish a new release.

## Release preparation and testing
Every 2nd Thursday morning all code currently merged in the development environment is included in a pull request into staging.

Included in this PR is an update to `version` in the app's `package.json`, following the release conventions detailed below.

The engineering team performs a quick scan of the pull request Thursday morning, and given 2 approvals, the code is merged into staging as a potential release candidate.

The QA team performs manual and automated regression testing on Thursday and Friday, with any regressions logged as Github issue tickets, to be fixed by the engineering team prior to the end of the week.

Assuming the testing process has passed and all blocking issues have been fixed, on Monday morning the staging environment is merged into production, and a release tag is created, triggering a production build.

The QA team performs a quick manual test of the app in production immediately following the release, and monitors Sentry and user feedback via email or Twitter throughout Monday, in case of a missed regression.

## Versioning
Fractal follows semantic versioning (https://semver.org/).

There are three types of releases: 

- **MAJOR**: Rare and usually aligns with a version upgrade to the [underlying smart contracts](https://github.com/decent-dao/fractal-contracts). These are changes incompatible with prior front end versions.
- **MINOR**: Adds backwards-compatible manner functionalities and bug fixes.
- **PATCH**: Adds backwards-compatible bug and/or security fixes and can be deployed instantaneously, bypassing a full release cycle. No new functionality will be introduced.
