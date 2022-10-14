import { Menu, Transition } from '@headlessui/react';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import useAvatar from '../../../hooks/useAvatar';
import useDisplayName from '../../../hooks/useDisplayName';
import DownArrow from '../svg/DownArrow';
import Avatar from './Avatar';
import MenuItems from './MenuItems';

function ConnectWallet({ account }: { account: string | null }) {
  if (account) {
    return null;
  }
  return <span className="text-sm text-gold-500">Connect Wallet</span>;
}

function WalletConnected({ account }: { account: string | null }) {
  const accountDisplayName = useDisplayName(account);
  const avatarURL = useAvatar(account);

  if (!account) {
    return null;
  }
  return (
    <>
      <Avatar
        address={account}
        url={avatarURL}
      />
      <div className="pl-2 flex flex-col items-end">
        <div className="sm:text-right text-sm text-gold-500">{accountDisplayName}</div>
      </div>
    </>
  );
}

function HeaderMenu() {
  const {
    state: { account },
  } = useWeb3Provider();

  return (
    <div className="flex items-center justify-center relative">
      <Menu>
        {({ open }: { open: boolean }) => (
          <>
            <Menu.Button className="transition duration-150 ease-in-out hover:text-stone-300 focus:outline-none flex items-center">
              <ConnectWallet account={account} />
              <WalletConnected account={account} />
              <div
                id="menu:down-arrow"
                className="text-sm font-medium text-white hover:text-stone-300 focus:shadow-outline-blue"
              >
                <DownArrow />
              </div>
            </Menu.Button>

            <Transition
              show={open}
              enter="transition ease-out duration-100"
              enterFrom="sm:transform sm:opacity-0 sm:scale-95"
              enterTo="sm:transform sm:opacity-100 sm:scale-100"
              leave="transition ease-in sm:duration-75"
              leaveFrom="sm:transform sm:opacity-100 sm:scale-100"
              leaveTo="sm:transform sm:opacity-0 sm:scale-95"
            >
              <MenuItems />
            </Transition>
          </>
        )}
      </Menu>
    </div>
  );
}

export default HeaderMenu;
