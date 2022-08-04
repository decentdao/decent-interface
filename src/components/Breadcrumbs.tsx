import { NavLink, useMatch, useLocation, useParams } from 'react-router-dom';
import useBreadcrumbs, { BreadcrumbMatch } from 'use-react-router-breadcrumbs';

import DetailsIcon from './ui/svg/Details';
import RightArrow from './ui/svg/RightArrow';
import TreasuryIcon from './ui/svg/Treasury';
import Favorite from './ui/Favorite';
import { useFractal } from '../providers/fractal/hooks/useFractal';
import { useModuleTypes } from '../controller/Modules/hooks/useModuleTypes';

function DAOName() {
  const params = useParams();
  const {
    dao: { daoAddress, daoName },
  } = useFractal();

  return <span>{daoName || daoAddress || params.address || '...'}</span>;
}

function ProposalId({ match }: { match: BreadcrumbMatch }) {
  const id = match.params.id;

  return <span>Proposal {id}</span>;
}

function Breadcrumbs() {
  const location = useLocation();
  const {
    dao: { daoAddress, moduleAddresses },
  } = useFractal();

  const { treasuryModule, tokenVotingGovernance } = useModuleTypes(moduleAddresses);

  const excludePaths: Array<string> = [];
  const home = '/';
  excludePaths.push(home);
  const matchHome = useMatch(home);

  const daos = '/daos';
  excludePaths.push(daos);
  const matchDaos = useMatch(daos);

  const daosNew = '/daos/new';
  excludePaths.push(daosNew);
  const matchDaosNew = useMatch(daosNew);

  const daosFavorites = '/daos/favorites';
  excludePaths.push(daosFavorites);
  const matchDaosFavorites = useMatch(daosFavorites);

  const modules = 'daos/:address/modules';
  excludePaths.push(modules);
  const matchModules = useMatch(modules);

  let moduleName =
    tokenVotingGovernance && location.pathname.includes(tokenVotingGovernance.moduleAddress)
      ? tokenVotingGovernance.moduleType
      : treasuryModule && location.pathname.includes(treasuryModule.moduleAddress)
      ? treasuryModule.moduleType
      : null;

  const breadcrumbOptions = { excludePaths };
  const routes = [
    { path: '/daos/:address', breadcrumb: DAOName },
    { path: 'daos/:address/modules/:moduleAddress', breadcrumb: moduleName },
    { path: '/daos/:address/proposals', breadcrumb: null },
    { path: '/daos/:address/proposals/new', breadcrumb: 'New Proposal' },
    { path: '/daos/:address/proposals/:id', breadcrumb: ProposalId },
  ];
  const breadcrumbs = useBreadcrumbs(routes, breadcrumbOptions);

  const anyExcludeMatch = [
    matchHome,
    matchDaos,
    matchDaosNew,
    matchDaosFavorites,
    matchModules,
  ].some(match => match !== null);
  if (anyExcludeMatch) {
    return <></>;
  }

  return (
    <div className="py-2 text-white bg-gray-600 bg-opacity-70 font-mono tracking-wider">
      <div className="container flex justify-between items-center flex-col sm:flex-row">
        <div className="mr-auto sm:mr-0">
          <div className="flex items-center">
            <Favorite />
            {breadcrumbs.map(({ match, breadcrumb }, i) => (
              <div
                key={match.pathname}
                className="flex"
              >
                {match.pathname === location.pathname ? (
                  <span>{breadcrumb}</span>
                ) : (
                  <NavLink
                    className="text-gold-500"
                    to={match.pathname}
                  >
                    {breadcrumb}
                  </NavLink>
                )}
                {i < breadcrumbs.length - 1 && (
                  <div className="mx-1">
                    <RightArrow />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        {breadcrumbs.length >= 1 && daoAddress && (
          <div className="flex gap-3 mt-2 sm:mt-0 ml-auto sm:ml-0">
            <NavLink
              to={`/daos/${daoAddress}/transactions/new`}
              className="flex items-center gap-2 text-gold-500 hover:text-gold-300"
            >
              <div className="text-sm font-semibold">+Transaction</div>
            </NavLink>
            <div className="border-r border-gray-100 mx-1" />
            {tokenVotingGovernance && (
              <NavLink
                to={`/daos/${daoAddress}/modules/${tokenVotingGovernance.moduleAddress}`}
                className="flex items-center gap-2 text-gold-500 hover:text-gold-300"
              >
                <DetailsIcon />
                <div className="text-sm font-semibold">Governance</div>
              </NavLink>
            )}
            {treasuryModule && (
              <NavLink
                to={`/daos/${daoAddress}/modules/${treasuryModule.moduleAddress}`}
                className="flex items-center gap-2 text-gold-500 hover:text-gold-300"
              >
                <TreasuryIcon />
                <div className="text-sm font-semibold">Treasury</div>
              </NavLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Breadcrumbs;
