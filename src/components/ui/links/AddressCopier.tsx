import { Text, Icon, LinkProps } from '@chakra-ui/react';
import { CopySimple } from '@phosphor-icons/react';
import { useCopyText } from '../../../hooks/utils/useCopyText';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import ExternalLink from './ExternalLink';

interface AddressCopierProps extends LinkProps {
  address: string;
}

/**
 * A component that displays a truncated address, along with the "copy to clipboard"
 * icon to the right of it.
 */
export default function AddressCopier({ address, ...rest }: AddressCopierProps) {
  const { etherscanBaseURL } = useNetworkConfig();
  const { accountSubstring } = useDisplayName(address);
  const copyToClipboard = useCopyText();

  return (
    <ExternalLink
      href={`${etherscanBaseURL}/address/${address}`}
      onClick={e => {
        e.preventDefault();
        copyToClipboard(address);
      }}
      width="fit-content"
      {...rest}
    >
      <Text
        alignItems="center"
        display="flex"
      >
        {accountSubstring}
        <Icon
          ml="0.5rem"
          as={CopySimple}
        />
      </Text>
    </ExternalLink>
  );
}
