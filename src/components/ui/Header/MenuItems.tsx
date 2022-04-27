import { Menu } from "@headlessui/react";
import { disconnect, connect } from "../../../web3/providers";
import { useWeb3 } from "../../../web3";
import Contact from "../svg/Contact";
import Support from "../svg/Support";
import Connect from "../svg/Connect";
import Disconnect from "../svg/Disconnect";
import Faq from "../svg/Faq";
import CopyToClipboard from "../CopyToClipboard";
import { truncateString } from "../../../utils";

interface MenuItem {
  title: string;
  Icon: () => JSX.Element;
}

interface ActionMenuItem extends MenuItem {
  isVisible?: boolean;
  action(): void;
}
interface LinkMenuItem extends MenuItem {
  link: string;
}

const CONTACT: LinkMenuItem = {
  title: "Contract",
  link: "https://discord.gg/24HFVzYVRF",
  Icon: Contact,
};

const SUPPORT: LinkMenuItem = {
  title: "Support",
  link: "https://fractalframework.xyz/fractal-overview",
  Icon: Support,
};

const FAQ: LinkMenuItem = {
  title: "FAQ",
  // @todo add link for FAQ
  link: "#",
  Icon: Faq,
};

const CONNECT_WALLET: ActionMenuItem = {
  title: "Connect Wallet",
  action: connect,
  Icon: Connect,
};

const DISCONNECT: ActionMenuItem = {
  title: "Disconnect",
  action: disconnect,
  Icon: Disconnect,
};

const ItemWrapper = (props: { children: JSX.Element | JSX.Element[]; noHoverEffect?: boolean }) => (
  <div className={`flex items-center gap-4 text-white p-4 ${!props.noHoverEffect ? "hover:bg-slate-200 hover:text-black" : ""}`}>{props.children}</div>
);

const ActionItem = ({ title, action, Icon, isVisible }: ActionMenuItem) => {
  if (!isVisible) {
    return null;
  }
  return (
    <Menu.Item>
      <ItemWrapper>
        <Icon />
        <button onClick={action}>{title}</button>
      </ItemWrapper>
    </Menu.Item>
  );
};

const LinkItem = ({ title, link, Icon }: LinkMenuItem) => {
  return (
    <Menu.Item>
      <ItemWrapper>
        <Icon />
        <a href={link} target="_blank" rel="noopener noreferrer">
          {title}
        </a>
      </ItemWrapper>
    </Menu.Item>
  );
};

const AddressCopyItem = ({ account }: { account?: string }) => {
  if (!account) {
    return null;
  }

  return (
    <ItemWrapper noHoverEffect>
      <span className="font-sans">{truncateString(account, 15)}</span>
      <CopyToClipboard textToCopy={account} />
    </ItemWrapper>
  );
};

const MenuItems = () => {
  const { account } = useWeb3();
  return (
    <Menu.Items
      static
      className="fixed left-0 w-full sm:absolute sm:left-auto sm:right-0 sm:w-max mt-6 pb-1 origin-top-right bg-gray-500 border border-gray-200 rounded-md shadow-menu"
    >
      <div className="font-mono">
        <section>
          <AddressCopyItem account={account} />
          <ActionItem {...DISCONNECT} isVisible={!!account} />
          <ActionItem {...CONNECT_WALLET} isVisible={!account} />
        </section>
        <section className="border-t border-gray-300">
          <LinkItem {...CONTACT} />
          <LinkItem {...SUPPORT} />
          <LinkItem {...FAQ} />
        </section>
      </div>
    </Menu.Items>
  );
};

export default MenuItems;
