import { Menu } from "@headlessui/react";
import { disconnect, connect } from "../../../web3/providers";
import { useWeb3 } from "../../../web3";
import Contact from "../svg/Contact";
import Support from "../svg/Support";
import Connect from "../svg/Connect";
import Disconnect from "../svg/Disconnect";
import Faq from "../svg/Faq";

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

const ItemWrapper = (props: { children: JSX.Element | JSX.Element[] }) => (
  <div className="flex items-center gap-4 text-white hover:bg-slate-200 hover:text-black py-2 px-4">{props.children}</div>
);

const ActionItem = ({ title, action, Icon, isVisible }: ActionMenuItem) => {
  if (!isVisible) {
    return null;
  }
  return (
    <Menu.Item>
      <ItemWrapper>
        <Icon />
        <button onClick={action}>
          {title}
        </button>
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

// const AddressCopyItem = () => {
//   // @todo use clipboard component?
//   return <></>;
// };

const MenuItems = () => {
  const { account } = useWeb3();
  return (
    <Menu.Items
      static
      className="absolute right-0 w-max mt-2 origin-top-right bg-gray-500 border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none"
    >
      <div className="font-mono">
        <section>
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
