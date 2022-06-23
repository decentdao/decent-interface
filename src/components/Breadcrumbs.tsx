import { NavLink, useMatch, useLocation, useParams } from 'react-router-dom';
import useBreadcrumbs, { BreadcrumbMatch } from 'use-react-router-breadcrumbs';

import { useDAOData } from '../contexts/daoData';
import DetailsIcon from './ui/svg/Details';
import RightArrow from './ui/svg/RightArrow';
import TreasuryIcon from './ui/svg/Treasury';
import Favorite from './ui/Favorite';

function DAOName() {
  const params = useParams();
  const [{ name, daoAddress }] = useDAOData();

  return <span>{name || daoAddress || params.address || '...'}</span>;
}

function ProposalId({ match }: { match: BreadcrumbMatch }) {
  const id = match.params.id;

  return <span>Proposal {id}</span>;
}

function Breadcrumbs() {
  const location = useLocation();
  const [{ daoAddress }] = useDAOData();
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

  const breadcrumbOptions = { excludePaths };
  const routes = [
    { path: '/daos/:address', breadcrumb: DAOName },
    { path: '/daos/:address/proposals', breadcrumb: null },
    { path: '/daos/:address/proposals/new', breadcrumb: 'New Proposal' },
    { path: '/daos/:address/proposals/:id', breadcrumb: ProposalId },
  ];
  const breadcrumbs = useBreadcrumbs(routes, breadcrumbOptions);

  const anyExcludeMatch = [matchHome, matchDaos, matchDaosNew, matchDaosFavorites].some(
    match => match !== null
  );
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
        {breadcrumbs.length === 1 && daoAddress && (
          <div className="flex gap-3 mt-2 sm:mt-0 ml-auto sm:ml-0">
            <NavLink
              to={`/daos/${daoAddress}/transactions/new`}
              className="flex items-center gap-2 text-gold-500 hover:text-gold-300"
            >
              <div className="text-sm font-semibold">+Transaction</div>
            </NavLink>
            <div className="border-r border-gray-100 mx-1" />
            <NavLink
              to={`/daos/${daoAddress}/details`}
              className="flex items-center gap-2 text-gold-500 hover:text-gold-300"
            >
              <DetailsIcon />
              <div className="text-sm font-semibold">Details</div>
            </NavLink>
            <NavLink
              to={`/daos/${daoAddress}/treasury`}
              className="flex items-center gap-2 text-gold-500 hover:text-gold-300"
            >
              <TreasuryIcon />
              <div className="text-sm font-semibold">Treasury</div>
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}

export default Breadcrumbs;
