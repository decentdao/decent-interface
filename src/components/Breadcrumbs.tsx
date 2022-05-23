import { NavLink, useMatch, useLocation, useParams } from "react-router-dom";
import useBreadcrumbs, { BreadcrumbMatch } from "use-react-router-breadcrumbs";

import { useDAOData } from "../contexts/daoData";
import { createAccountSubstring } from "../hooks/useDisplayName";
import CopyToClipboard from "./ui/CopyToClipboard";
import EtherscanLink from "./ui/EtherscanLink";
import Info from "./ui/svg/Info";
import RightArrow from "./ui/svg/RightArrow";
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
    <div className="py-2 text-white bg-gray-600 bg-opacity-70 font-mono tracking-wider flex justify-between">
      <div className="container">
        <TooltipWrapper
          isVisible={breadcrumbs.length === 1}
          content={
            daoAddress && (
              <div>
                <h4 className="text-gray-50 text-xs">DAO Address:</h4>
                <div className="flex text-gold-500">
                  <EtherscanLink address={daoAddress}>
                    <span className="cursor-pointer text-sm">{createAccountSubstring(daoAddress)}</span>
                  </EtherscanLink>
                  <CopyToClipboard textToCopy={daoAddress} />
                </div>
              </div>
            )
          }
        >
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
      {/* @todo add  treasury link (space-between)*/}
    </div>
  );
}

export default Breadcrumbs;
