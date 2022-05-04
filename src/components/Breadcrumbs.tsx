import { NavLink, useMatch, useLocation, useParams } from 'react-router-dom';
import useBreadcrumbs, { BreadcrumbMatch } from 'use-react-router-breadcrumbs';

import { useDAOData } from '../daoData';
import RightArrow from './ui/svg/RightArrow';

const DAOName = () => {
  const params = useParams();
  const [{ name, daoAddress }] = useDAOData();

  return (
    <span>{name || daoAddress || params.address || "..."}</span>
  );
}

const ProposalId = ({ match }: { match: BreadcrumbMatch }) => {
  const id = match.params.id;

  return (
    <span>Proposal {id}</span>
  );
}

function Breadcrumbs() {
  const location = useLocation();

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

  const breadcrumbOptions = { excludePaths };
  const routes = [
    { path: '/daos/:address', breadcrumb: DAOName },
    { path: '/daos/:address/proposals', breadcrumb: null },
    { path: '/daos/:address/proposals/new', breadcrumb: "New Proposal" },
    { path: '/daos/:address/proposals/:id', breadcrumb: ProposalId }
  ];
  const breadcrumbs = useBreadcrumbs(routes, breadcrumbOptions);

  const anyExcludeMatch = [matchHome, matchDaos, matchDaosNew].some(match => match !== null);
  if (anyExcludeMatch) {
    return <></>;
  }

  return (
    <div className="py-2 text-white bg-gray-600 bg-opacity-70 font-mono tracking-wider">
      <div className="container flex">
        {breadcrumbs.map(({ match, breadcrumb }, i) => (
          <div key={match.pathname} className="flex">
            {match.pathname === location.pathname
              ? <span>{breadcrumb}</span>
              : <NavLink className="text-gold-500" to={match.pathname}>{breadcrumb}</NavLink>
            }
            {i < breadcrumbs.length - 1 && (
              <div className="mx-1">
                <RightArrow />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Breadcrumbs;
