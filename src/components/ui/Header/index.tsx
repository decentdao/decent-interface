import { Link } from "react-router-dom";
import FractalLogo from "../svg/Logo";
import HeaderMenu from "./HeaderMenu";

function Header() {
  return (
    <header className="py-4 bg-gray-600">
      <div className="container flex justify-between items-center">
        <div className="mr-4">
          <Link to="/">
            <FractalLogo />
          </Link>
        </div>
        <HeaderMenu />
      </div>
    </header>
  );
}

export default Header;
