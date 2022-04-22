import { ReactNode } from 'react';
import EtherscanLink from '../../ui/EtherscanLink';

const SearchError = ({
  children
}: {
  children: ReactNode
}) => {
  return (
    <div className="text-red text-sm">
      {children}
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
  setSearchFailed

}: {
  searchAddress: string | undefined,
  loading: boolean,
  validAddress: boolean,
  address: string | undefined,
  addressIsDAO: boolean,
  validDAOComponent: React.ReactNode,
  setSearchFailed?: React.Dispatch<React.SetStateAction<boolean>>,
}) {
  if (loading === true) {
    return (
      <div><span className="break-all">{searchAddress}</span> loading</div>
    );
  }

  if (searchAddress !== undefined && validAddress === false) {
    if(setSearchFailed) {
      setSearchFailed(true);
    }
    return (
      <SearchError>Please use a valid Fractal ETH address or ENS domain</SearchError>
    );
  }

  if (address !== undefined && addressIsDAO === false) {
    if(setSearchFailed) {
      setSearchFailed(true);
    }
    return (
      <div>
        <EtherscanLink address={searchAddress}>
          <SearchError>
            <div className="text-red-500 text-sm">
              {searchAddress} Sorry a fractal does not exist on this address
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
