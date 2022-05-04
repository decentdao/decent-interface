import { ReactNode } from 'react';
import EtherscanLink from '../../ui/EtherscanLink';

const SearchError = ({
  children
}: {
  children: ReactNode
}) => {
  return (
    <div className="text-red pt-1 text-sm">
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
}: {
  searchAddress?: string,
  loading: boolean,
  validAddress: boolean,
  address?: string,
  addressIsDAO?: boolean,
  validDAOComponent: React.ReactNode,
}) {
  if ((loading !== true && searchAddress === undefined) || searchAddress === "") {
    return (
      <p className="text-gray-50 pt-1 text-sm">Use a valid Fractal ETH address or ENS domain</p>
    )
  }

  if (loading === true) {
    return (
      <div className="break-all text-gray-50 pt-1 text-sm">loading... {searchAddress}</div>
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
            {searchAddress} Sorry a fractal does not exist on this address
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
