import { Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useImage } from 'react-image';
import logo from "../assets/imgs/Logo.svg"
import { useWeb3 } from '../web3';
import { connect, disconnect } from '../web3/providers';
import useDisplayName from '../hooks/useDisplayName';
import useAvatar from '../hooks/useAvatar';
import EtherscanLink from './ui/EtherscanLink';

function JazziconAvatar({
  address,
}: {
  address: string,
}) {
  return (
    <div className="ml-2 h-8 w-8">
      <Jazzicon address={address} />
    </div>
  );
}

function URLAvatar({
  url,
}: {
  url: string,
}) {
  const { src } = useImage({
    srcList: url
  })

  return (
    <div className="ml-2 h-8 w-8">
      <img className="rounded-full" src={src} alt="avatar" />
    </div>
  );
}

function Avatar({
  address,
  url,
}: {
  address: string,
  url: string | null,
}) {
  if (!url) {
    return (
      <JazziconAvatar address={address} />
    )
  }

  return (
    <Suspense fallback={<JazziconAvatar address={address} />}>
      <URLAvatar url={url} />
    </Suspense>
  )
}

function Header() {
  const [dropDown, setDropDown] = useState<boolean>(false);
  const { account } = useWeb3();
  const accountDisplayName = useDisplayName(account);
  const avatarURL = useAvatar(account);

  const toggleDropDown = () => {
    setDropDown((curr) => !curr)
  }

  return (
    <header className="py-4 border-b bg-header-black">
      <div className="container flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="mr-2 mb-4 sm:mb-0">
          <div className="mr-2 text-2xl text-white tracking-widest">
            <Link to="/">
              <img src={logo} alt="Logo" />
            </Link>
          </div>
        </div>
        <div className="sm:text-right text-sm text-header-gold">
          {!account && (
            <button
              onClick={connect}
              disabled={false}
            >
              Connect Wallet
            </button>
          )}
          {account && (
            <div className="flex items-center">
              <EtherscanLink address={account}>
                <Avatar address={account} url={avatarURL} />
              </EtherscanLink>
              <div className="pl-2 flex flex-col items-end">
                <div className="sm:text-right text-sm">
                  <EtherscanLink address={account}>
                    {accountDisplayName}
                  </EtherscanLink>
                </div>
              </div>

              <div className="relative">
                <button
                  id="dropdownInformationButton"
                  data-dropdown-toggle="dropdownInformation"
                  className="text-white"
                  onClick={toggleDropDown}
                  type="button">
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {
                  dropDown &&
                  <div id="dropdownInformation"
                    className="bg-white absolute right-0 text-base z-50 list-none divide-y divide-gray-100 rounded shadow my-4">
                    <div className="py-1">
                      <button
                        className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                        onClick={disconnect}
                      >
                        Disconnect
                      </button>

                    </div>
                  </div>
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
