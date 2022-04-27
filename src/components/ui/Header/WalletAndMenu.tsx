import { disconnect } from "process";
import useAvatar from "../../../hooks/useAvatar";
import useDisplayName from "../../../hooks/useDisplayName";
import { useWeb3 } from "../../../web3";
import { connect } from "../../../web3/providers";
import EtherscanLink from "../EtherscanLink";
import Avatar from "./Avatar";
import HeaderDropdown from "./HeaderDropdown";

const WalletAndMenu = () => {
  const { account } = useWeb3();
  const accountDisplayName = useDisplayName(account);
  const avatarURL = useAvatar(account);

  if (!account) {
    return <button onClick={connect}>Connect Wallet</button>;
  }
  return (
    <div className="flex items-center">
      <EtherscanLink address={account}>
        <Avatar address={account} url={avatarURL} />
      </EtherscanLink>
      <div className="pl-2 flex flex-col items-end">
        <div className="sm:text-right text-sm">
          <EtherscanLink address={account}>{accountDisplayName}</EtherscanLink>
        </div>
      </div>
      <HeaderDropdown disconnect={disconnect} />
    </div>
  );
};

export default WalletAndMenu;
