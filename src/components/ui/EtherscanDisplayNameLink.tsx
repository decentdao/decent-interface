import useDisplayName from '../../hooks/useDisplayName';
import EtherscanLinkAddress from './EtherscanLinkAddress';

function EtherscanDisplayNameLink({ address }: { address?: string }) {
  const displayName = useDisplayName(address);

  if (!address) {
    return null;
  }

  return <EtherscanLinkAddress address={address}>{displayName}</EtherscanLinkAddress>;
}

export default EtherscanDisplayNameLink;
