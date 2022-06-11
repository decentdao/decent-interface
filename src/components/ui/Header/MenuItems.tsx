import { Menu } from '@headlessui/react';
import Contact from '../svg/Contact';
import Support from '../svg/Support';
import Connect from '../svg/Connect';
import Disconnect from '../svg/Disconnect';
import Faq from '../svg/Faq';
import Docs from '../svg/Docs';
import CopyToClipboard from '../CopyToClipboard';
import EtherscanLink from '../EtherscanLink';
import useDisplayName from '../../../hooks/useDisplayName';
import cx from 'classnames';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';

interface MenuItem {
  title: string;
  className?: string;
  Icon: () => JSX.Element;
}

interface ActionMenuItem extends MenuItem {
  isVisible?: boolean;
  action(): void;
}
interface LinkMenuItem extends MenuItem {
  link: string;
}

const COMMUNITY: LinkMenuItem = {
  title: 'Community',
  link: 'https://discord.gg/24HFVzYVRF',
  Icon: Contact,
};

const OVERVIEW: LinkMenuItem = {
  title: 'Overview',
  link: 'https://docs.fractalframework.xyz/welcome-to-fractal/overview/what-is-fractal',
  Icon: Support,
};

const FAQ: LinkMenuItem = {
  title: 'FAQ',
  link: 'https://docs.fractalframework.xyz/welcome-to-fractal/overview/faq',
  Icon: Faq,
};

const DOCS: LinkMenuItem = {
  title: 'Docs',
  link: 'https://docs.fractalframework.xyz/welcome-to-fractal',
  Icon: Docs,
};

const CONNECT_WALLET = (connect: () => void): ActionMenuItem => ({
  title: 'Connect Wallet',
  action: connect,
  Icon: Connect,
});

const DISCONNECT = (disconnect: () => void): ActionMenuItem => ({
  title: 'Disconnect',
  action: disconnect,
  Icon: Disconnect,
});

function ItemWrapper(props: {
  children: JSX.Element | JSX.Element[];
  noHoverEffect?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'flex items-center justify-start gap-4 text-white p-4',
        {
          'hover:bg-slate-200 hover:text-black': !props.noHoverEffect,
        },
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

function ActionItem({ title, className, action, Icon, isVisible }: ActionMenuItem) {
  if (!isVisible) {
    return null;
  }
  return (
    <Menu.Item>
      <button
        onClick={action}
        className={cx('w-full', className)}
      >
        <ItemWrapper className={className}>
          <Icon />
          <span>{title}</span>
        </ItemWrapper>
      </button>
    </Menu.Item>
  );
}

function LinkItem({ title, link, Icon }: LinkMenuItem) {
  return (
    <Menu.Item>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ItemWrapper>
          <Icon />
          <span>{title}</span>
        </ItemWrapper>
      </a>
    </Menu.Item>
  );
}

function AddressCopyItem({ account }: { account: string | null }) {
  const accountDisplayName = useDisplayName(account);
  if (!account) {
    return null;
  }
  return (
    <ItemWrapper noHoverEffect>
      <span className="text-gold-300">
        <EtherscanLink address={account}>{accountDisplayName}</EtherscanLink>
      </span>
      <CopyToClipboard textToCopy={account} />
    </ItemWrapper>
  );
}

function MenuItems() {
  const {
    state: { account },
    connect,
    disconnect,
  } = useWeb3Provider();
  return (
    <Menu.Items
      static
      className="fixed left-0 w-full sm:absolute z-10 sm:left-auto sm:right-0 sm:w-max mt-6 pb-1 origin-top-right bg-gray-500 border border-gray-200 rounded-md shadow-menu"
    >
      <div className="font-mono">
        <section>
          <AddressCopyItem account={account} />
          <ActionItem
            {...DISCONNECT(disconnect)}
            isVisible={!!account}
            className="text-red"
          />
          <ActionItem
            {...CONNECT_WALLET(connect)}
            isVisible={!account}
          />
        </section>
        <section className="border-t border-gray-300">
          <LinkItem {...COMMUNITY} />
          <LinkItem {...OVERVIEW} />
          <LinkItem {...FAQ} />
          <LinkItem {...DOCS} />
        </section>
      </div>
    </Menu.Items>
  );
}

export default MenuItems;
