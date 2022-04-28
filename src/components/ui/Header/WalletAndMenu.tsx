import useAvatar from "../../../hooks/useAvatar";
import useDisplayName from "../../../hooks/useDisplayName";
import { useWeb3 } from "../../../web3";
import { connect } from "../../../web3/providers";
import EtherscanLink from "../EtherscanLink";
import Avatar from "./Avatar";
import HeaderMenu from "./HeaderMenu";

const ConnectWallet = ({ account }: { account?: string }) => {
  if(account) {
    return null
  }
  return (
    <>
      <button className="text-sm text-gold-500" onClick={connect}>
        Connect Wallet
      </button>
    </>
  );
};

const WalletConnected = ({ account }: { account?: string }) => {
  const accountDisplayName = useDisplayName(account);
  const avatarURL = useAvatar(account);

  if(!account) {
    return null
  }
  return (
    <>
      <EtherscanLink address={account}>
        <Avatar address={account} url={avatarURL} />
      </EtherscanLink>
      <div className="pl-2 flex flex-col items-end">
        <div className="sm:text-right text-sm text-gold-500">
          <EtherscanLink address={account}>{accountDisplayName}</EtherscanLink>
        </div>
      </div>
    </>
  );
};

const WalletAndMenu = () => {
  const { account } = useWeb3();
  return (
    <div className="flex items-center">
      <HeaderMenu />
    </div>
  );
};

export default WalletAndMenu;
