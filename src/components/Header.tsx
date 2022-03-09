import { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Jazzicon } from '@ukstv/jazzicon-react';
import { useImage } from 'react-image';

import { useWeb3 } from '../web3';
import { connect, disconnect } from '../web3/providers';
import Button from './ui/Button';
import useDisplayName from '../hooks/useDisplayName';
import useAvatar from '../hooks/useAvatar';
import EtherscanLink from './ui/EtherscanLink';

function JazziconAvatar({
  address,
}: {
  address: string,
}) {
  return (
    <div className="ml-2 h-10 w-10">
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
    <div className="ml-2 h-10 w-10">
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
    <header className="py-4 border-b">
      <div className="container flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div className="mr-2 mb-4 sm:mb-0">
          <div className="mr-2 text-2xl">
            <Link to="/">
              fractal
            </Link>
          </div>
        </div>
        <div className="sm:text-right">
          {!account && (
            <Button
              onClick={connect}
              disabled={false}
            >
              connect wallet
            </Button>
          )}
          {account && (
            <div className="flex items-center">
              <div className="flex flex-col items-end">
                <div className="text-xl">
                  <EtherscanLink address={account}>
                    {accountDisplayName}
                  </EtherscanLink>
                </div>
                <button
                  className="px-0.5 border rounded shadow text-xs block"
                  onClick={disconnect}
                >
                  disconnect
                </button>
              </div>
              <EtherscanLink address={account}>
                <Avatar address={account} url={avatarURL} />
              </EtherscanLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
