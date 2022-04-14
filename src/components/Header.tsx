import { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useImage } from 'react-image';
import logo from "../assets/imgs/Logo.svg"
import { useWeb3 } from '../web3';
import { connect, disconnect } from '../web3/providers';
import useDisplayName from '../hooks/useDisplayName';
import useAvatar from '../hooks/useAvatar';
import EtherscanLink from './ui/EtherscanLink';
import HeaderDropdown from './ui/HeaderDropdown';

function JazziconAvatar({
  address,
}: {
  address: string,
}) {
  return (
    <div className="h-7 w-7">
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
    <div className="ml-2 h-7 w-7">
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
  const { account } = useWeb3();
  const accountDisplayName = useDisplayName(account);
  const avatarURL = useAvatar(account);

  return (
    <header className="py-4 border-b bg-header-black">
      <div className="container flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="mr-2 mb-4 sm:mb-0">
          <div className="mr-2 text-2xl text-white tracking-logo">
            <Link to="/">
              FRACTAL
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
              <HeaderDropdown disconnect={disconnect} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
