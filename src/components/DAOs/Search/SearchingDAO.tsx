import { ReactNode } from 'react';
import H1 from '../../ui/H1';

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
  // if ((loading !== true && searchAddress === undefined) || searchAddress === "") {
  //   return (
  //     <p className="text-gray-50 pt-1 text-sm">Use a valid Fractal ETH address or ENS domain</p>
  //   )
  // }

  console.log({ searchAddress, loading, validAddress, address, addressIsDAO })

  if (loading === true) {
    return (
      <H1>Loading...</H1>
    );
  }

  if (searchAddress !== undefined && validAddress === false) {
    return (
      <SearchError>Please use a valid Fractal ETH address or ENS domain</SearchError>
    );
  }

  if (address !== undefined && addressIsDAO === false) {
    return (
      <SearchError>
        Sorry a fractal does not exist on this address
      </SearchError>
    );
  }

  return (
    <>{validDAOComponent}</>
  );
}

export default SearchingDAO;
