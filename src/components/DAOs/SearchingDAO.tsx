import { ReactNode } from 'react';
import EtherscanLink from '../ui/EtherscanLink';

const SearchError = ({
  children
}: {
  children: ReactNode
}) => {
  return (
    <div className="text-center text-red-500 text-sm">
      <span className="break-all">
        {children}
      </span>
    </div>
  )
}

function SearchingDAO({
  searchAddress,
  loading,
  validAddress,
  address,
  addressIsDAO,
  validDAOComponent,
}: {
  searchAddress: string | undefined,
  loading: boolean,
  validAddress: boolean,
  address: string | undefined,
  addressIsDAO: boolean,
  validDAOComponent: React.ReactNode,
}) {
  if (loading === true) {
    return (
      <div><span className="break-all">{searchAddress}</span> loading</div>
    );
  }

  if (searchAddress !== undefined && validAddress === false) {
    return (
      <SearchError>Please use a valid Fractal ETH address or ENS domain</SearchError>
    );
  }

  if (address !== undefined && addressIsDAO === false) {
    return (
      <div>
        <EtherscanLink address={searchAddress}>
          <SearchError>
            <div className="text-center text-red-500 text-sm">
              <span className="break-all">
                {searchAddress} is not a dao...
              </span>
            </div>
          </SearchError>
        </EtherscanLink>
      </div>
    );
  }

  return (
    <>{validDAOComponent}</>
  );
}

export default SearchingDAO;
