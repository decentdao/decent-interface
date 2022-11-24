import useDisplayName from '../../hooks/utils/useDisplayName';
import EtherscanLinkAddress from '../ui/EtherscanLinkAddress';
import CopyToClipboard from './CopyToClipboard';

interface TooltipAddressContentProps {
  address: string;
  title: string;
}

function TooltipAddressContent({ address, title }: TooltipAddressContentProps) {
  const { accountSubstring } = useDisplayName(address);
  return (
    <div>
      <h4 className="text-gray-50 text-xs">{title}</h4>
      <div className="flex text-gold-500">
        <EtherscanLinkAddress address={address}>
          <span className="cursor-pointer text-sm">{accountSubstring}</span>
        </EtherscanLinkAddress>
        <CopyToClipboard textToCopy={address} />
      </div>
    </div>
  );
}

export default TooltipAddressContent;
