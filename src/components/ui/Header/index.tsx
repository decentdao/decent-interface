import { Link } from "react-router-dom";
import WalletAndMenu from "./WalletAndMenu";

function Header() {
  return (
    <header className="py-4 bg-gray-600">
      <div className="container flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="mr-2 mb-4 sm:mb-0">
          <div className="mr-2 text-2xl uppercase text-white tracking-widest">
            <Link to="/">fractal</Link>
          </div>
        </div>
        <div className="sm:text-right text-sm text-gold-500">
          <WalletAndMenu />
        </div>
      </div>
    </header>
  );
}

export default Header;
