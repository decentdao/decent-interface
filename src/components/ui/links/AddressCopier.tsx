import { ButtonProps, Text } from '@chakra-ui/react';
import { CopySimple } from '@phosphor-icons/react';
import { useCopyText } from '../../../hooks/utils/useCopyText';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import CeleryButtonWithIcon from '../utils/CeleryButtonWithIcon';
import EtherscanLinkAddress from './EtherscanLinkAddress';

interface Props extends ButtonProps {
  address: string;
}

/**
 * A component that displays a truncated address, along with the "copy to clipboard"
 * icon to the right of it.
 */
export default function AddressCopier({ address, ...rest }: Props) {
  const { accountSubstring } = useDisplayName(address);
  const copyToClipboard = useCopyText();

  return (
    <CeleryButtonWithIcon
      onClick={() => copyToClipboard(address)}
      icon={CopySimple}
      iconPosition="end"
      {...rest}
    >
      <EtherscanLinkAddress address={address}>
        <Text>{accountSubstring}</Text>
      </EtherscanLinkAddress>
    </CeleryButtonWithIcon>
  );
}
