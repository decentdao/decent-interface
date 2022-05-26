import { useState, useEffect } from "react";
import { Link, useMatch } from "react-router-dom";
import FractalLogo from "../svg/Logo";
import HeaderMenu from "./HeaderMenu";

function Header() {
  const daoHomeMatch = useMatch("/daos/:id/*");
  const [daoHome, setDaoHome] = useState("/");
  const [validatedAddress, setValidatedAddress] = useState<string>();
  
  useEffect(() => {
    if (daoHomeMatch) {
      setDaoHome(daoHomeMatch.pathnameBase);
      setValidatedAddress(daoHomeMatch.params.id);
    } else {
      setDaoHome("/");
      setValidatedAddress(undefined);
    }
  }, [daoHomeMatch]);

  return (
    <header className="py-4 bg-gray-600">
      <div className="container flex justify-between items-center">
        <div className="mr-4">
          <Link to={daoHome} state={{ validatedAddress }}>
            <FractalLogo />
          </Link>
        </div>
        <HeaderMenu />
      </div>
    </header>
  );
}

export default Header;
