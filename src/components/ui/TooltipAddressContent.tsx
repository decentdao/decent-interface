import { createAccountSubstring } from '../../hooks/useDisplayName';
import CopyToClipboard from './CopyToClipboard';
import EtherscanLink from './EtherscanLink';

interface TooltipAddressContentProps {
  address: string;
  title: string;
}

function TooltipAddressContent({ address, title }: TooltipAddressContentProps) {
  return (
    <div>
      <h4 className="text-gray-50 text-xs">{title}</h4>
      <div className="flex text-gold-500">
        <EtherscanLink address={address}>
          <span className="cursor-pointer text-sm">{createAccountSubstring(address)}</span>
        </EtherscanLink>
        <CopyToClipboard textToCopy={address} />
      </div>
    </div>
  );
}

export default TooltipAddressContent;
