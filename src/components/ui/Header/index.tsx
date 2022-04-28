import { Link } from "react-router-dom";
import WalletAndMenu from "./WalletAndMenu";
import FractalLogo from '../svg/Logo';

function Header() {
  return (
    <header className="py-4 bg-gray-600">
      <div className="container flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="mr-2 mb-4 sm:mb-0">
          <div className="mr-2 text-3xl uppercase text-white font-bold font-mono tracking-widest">
            <Link to="/"><FractalLogo /></Link>
          </div>
        </div>
        <WalletAndMenu />
      </div>
    </header>
  );
}

export default Header;
