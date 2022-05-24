import { NavLink, useMatch, useLocation, useParams } from "react-router-dom";
import useBreadcrumbs, { BreadcrumbMatch } from "use-react-router-breadcrumbs";

import { useDAOData } from "../contexts/daoData";
import DetailsIcon from "./ui/svg/Details";
import Info from "./ui/svg/Info";
import RightArrow from "./ui/svg/RightArrow";
import TreasuryIcon from "./ui/svg/Treasury";
import TooltipAddressContent from "./ui/TooltipAddressContent";
import TooltipWrapper from "./ui/TooltipWrapper";

const DAOName = () => {
  const params = useParams();
  const [{ name, daoAddress }] = useDAOData();

  return <span>{name || daoAddress || params.address || "..."}</span>;
};

const ProposalId = ({ match }: { match: BreadcrumbMatch }) => {
  const id = match.params.id;

  return <span>Proposal {id}</span>;
};

function Breadcrumbs() {
  const location = useLocation();
  const [{ daoAddress }] = useDAOData();
  const excludePaths: Array<string> = [];
  const home = "/";
  excludePaths.push(home);
  const matchHome = useMatch(home);

  const daos = "/daos";
  excludePaths.push(daos);
  const matchDaos = useMatch(daos);

  const daosNew = "/daos/new";
  excludePaths.push(daosNew);
  const matchDaosNew = useMatch(daosNew);

  const breadcrumbOptions = { excludePaths };
  const routes = [
    { path: "/daos/:address", breadcrumb: DAOName },
    { path: "/daos/:address/proposals", breadcrumb: null },
    { path: "/daos/:address/proposals/new", breadcrumb: "New Proposal" },
    { path: "/daos/:address/proposals/:id", breadcrumb: ProposalId },
  ];
  const breadcrumbs = useBreadcrumbs(routes, breadcrumbOptions);

  const anyExcludeMatch = [matchHome, matchDaos, matchDaosNew].some((match) => match !== null);
  if (anyExcludeMatch) {
    return <></>;
  }

  return (
    <div className="py-2 text-white bg-gray-600 bg-opacity-70 font-mono tracking-wider">
      <div className="container flex justify-between items-center">
        <div>
          <TooltipWrapper isVisible={breadcrumbs.length === 1} content={daoAddress && <TooltipAddressContent address={daoAddress} title="DAO address:" />}>
            <div className="flex">
              {breadcrumbs.map(({ match, breadcrumb }, i) => (
                <div key={match.pathname} className="flex">
                  {match.pathname === location.pathname ? (
                    <span>{breadcrumb}</span>
                  ) : (
                    <NavLink className="text-gold-500" to={match.pathname}>
                      {breadcrumb}
                    </NavLink>
                  )}
                  {i < breadcrumbs.length - 1 && (
                    <div className="mx-1">
                      <RightArrow />
                    </div>
                  )}
                  {breadcrumbs.length === 1 && daoAddress && (
                    <div className="ml-2">
                      <Info />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TooltipWrapper>
        </div>
        {breadcrumbs.length === 1 && daoAddress && (
          <div className="flex gap-4 sm:gap-2">
            <NavLink to={`/daos/${daoAddress}/details`} className="flex items-center gap-2 text-gold-500 hover:text-gold-300">
              <div className="text-sm font-semibold">Details</div>
              <DetailsIcon />
            </NavLink>
            <NavLink to={`/daos/${daoAddress}/treasury`} className="flex items-center gap-2 text-gold-500 hover:text-gold-300">
              <div className="text-sm font-semibold">Treasury</div>
              <TreasuryIcon />
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}

export default Breadcrumbs;
