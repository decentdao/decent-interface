import { Link, useParams } from "react-router-dom";

import useAddress from '../hooks/useAddress';

function DAO() {
  const params = useParams();
  const [address, validAddress, addressLoading] = useAddress(params.address);

  if (addressLoading === true) {
    return (
      <div>
        loading up <span className="break-all">{params.address}</span>
      </div>
    );
  }

  if (validAddress === true) {
    return (
      <div>
        <div>that's a valid address!</div>
        <div>{address}</div>
      </div>
    );
  }

  if (validAddress === false) {
    return (
      <div>
        <div><span className="break-all">{params.address}</span> is an invalid address</div>
        <Link to="/">go back home</Link>
      </div>
    );
  }

  return (
    <></>
  );
}

export default DAO;
