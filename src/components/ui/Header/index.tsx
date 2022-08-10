import { useState, useEffect } from 'react';
import { Link, useMatch } from 'react-router-dom';
import { useFractal } from '../../../providers/fractal/hooks/useFractal';
import FractalLogo from '../svg/Logo';
import HeaderMenu from './HeaderMenu';

function Header() {
  const {
    dao: { daoAddress },
  } = useFractal();
  const daoHomeMatch = useMatch('/daos/:address/*');
  const [daoHome, setDaoHome] = useState('/');
  const [validatedAddress, setValidatedAddress] = useState<string>();

  useEffect(() => {
    if (daoHomeMatch && daoAddress) {
      setDaoHome(daoHomeMatch.pathnameBase);
      setValidatedAddress(daoHomeMatch.params.address);
    } else {
      setDaoHome('/');
      setValidatedAddress(undefined);
    }
  }, [daoHomeMatch, daoAddress]);

  return (
    <header className="py-4 bg-gray-600">
      <div className="container flex justify-between items-center">
        <div className="mr-4">
          <Link
            to={daoHome}
            state={{ validatedAddress }}
          >
            <FractalLogo />
          </Link>
        </div>
        <HeaderMenu />
      </div>
    </header>
  );
}

export default Header;
