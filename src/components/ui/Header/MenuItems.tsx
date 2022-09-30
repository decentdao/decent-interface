import { Menu } from '@headlessui/react';
import Contact from '../svg/Contact';
import Support from '../svg/Support';
import Connect from '../svg/Connect';
import Disconnect from '../svg/Disconnect';
import { StarEmpty } from '../svg/Star';
import Faq from '../svg/Faq';
import Docs from '../svg/Docs';
import CopyToClipboard from '../CopyToClipboard';
import EtherscanLinkAddress from '../EtherscanLinkAddress';
import cx from 'classnames';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { Link } from 'react-router-dom';
import { useBlockchainData } from '../../../contexts/blockchainData';
import { useTranslation } from 'react-i18next';

interface MenuItem {
  titleKey: string;
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
  titleKey: 'menuCommunity',
  link: 'https://discord.gg/decent-dao',
  Icon: Contact,
};

const OVERVIEW: LinkMenuItem = {
  titleKey: 'menuOverview',
  link: 'https://docs.fractalframework.xyz/welcome-to-fractal/the-core-framework/developer-overview',
  Icon: Support,
};

const FAQ: LinkMenuItem = {
  titleKey: 'menuFaq',
  link: 'https://docs.fractalframework.xyz/welcome-to-fractal/overview/faq',
  Icon: Faq,
};

const DOCS: LinkMenuItem = {
  titleKey: 'menuDocs',
  link: 'https://docs.fractalframework.xyz/welcome-to-fractal',
  Icon: Docs,
};

const FAVORITES: LinkMenuItem = {
  titleKey: 'menuFavorites',
  link: '/daos/favorites',
  Icon: StarEmpty,
};

const CONNECT_WALLET = (connect: () => void): ActionMenuItem => ({
  titleKey: 'menuConnect',
  action: connect,
  Icon: Connect,
});

const DISCONNECT = (disconnect: () => void): ActionMenuItem => ({
  titleKey: 'menuDisconnect',
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

function ItemContent({
  title,
  className,
  Icon,
}: {
  title: string;
  className?: string;
  Icon: () => JSX.Element;
}) {
  return (
    <ItemWrapper className={className}>
      <Icon />
      <span>{title}</span>
    </ItemWrapper>
  );
}

function ActionItem({ titleKey: title, className, action, Icon, isVisible }: ActionMenuItem) {
  const { t } = useTranslation('menu');
  if (!isVisible) {
    return null;
  }
  return (
    <Menu.Item>
      <button
        onClick={action}
        className={cx('w-full', className)}
      >
        <ItemContent
          title={t(title)}
          className={className}
          Icon={Icon}
        />
      </button>
    </Menu.Item>
  );
}

function LinkItem({ titleKey: title, link, Icon }: LinkMenuItem) {
  const { t } = useTranslation('menu');
  return (
    <Menu.Item>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ItemContent
          title={t(title)}
          Icon={Icon}
        />
      </a>
    </Menu.Item>
  );
}

function LinkItemInternal({ titleKey: title, link, Icon }: LinkMenuItem) {
  const { t } = useTranslation('menu');
  return (
    <Menu.Item>
      <Link to={link}>
        <ItemContent
          title={t(title)}
          Icon={Icon}
        />
      </Link>
    </Menu.Item>
  );
}

function AddressCopyItem({ account }: { account: string | null }) {
  const { accountDisplayName } = useBlockchainData();
  if (!account) {
    return null;
  }
  return (
    <ItemWrapper noHoverEffect>
      <span className="text-gold-300">
        <EtherscanLinkAddress address={account}>{accountDisplayName}</EtherscanLinkAddress>
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
          <LinkItemInternal {...FAVORITES} />
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
