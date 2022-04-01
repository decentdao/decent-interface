import EtherscanLink from '../ui/EtherscanLink';

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
      <div className="text-center text-red-500 text-sm"><span className="break-all"></span>Please use a valid Fractal ETH address or ENS domain</div>
    );
  }

  if (address !== undefined && addressIsDAO === false) {
    return (
      <div>
        <EtherscanLink address={searchAddress}>
          <span className="break-all">{searchAddress}</span>
        </EtherscanLink> is not a dao
      </div>
    );
  }

  return (
    <>{validDAOComponent}</>
  );
}

export default SearchingDAO;
