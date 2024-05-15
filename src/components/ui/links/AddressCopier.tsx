import { Text, Icon, Button, ButtonProps } from '@chakra-ui/react';
import { CopySimple } from '@phosphor-icons/react';
import { useCopyText } from '../../../hooks/utils/useCopyText';
import useDisplayName from '../../../hooks/utils/useDisplayName';

interface AddressCopierProps extends ButtonProps {
  address: string;
}

/**
 * A component that displays a truncated address, along with the "copy to clipboard"
 * icon to the right of it.
 */
export default function AddressCopier({ address, ...rest }: AddressCopierProps) {
  const { accountSubstring } = useDisplayName(address);
  const copyToClipboard = useCopyText();

  return (
    <Button
      variant="unstyled"
      color="celery-0"
      padding="0.25rem 0.75rem"
      gap="0.25rem"
      borderRadius="625rem"
      borderColor="transparent"
      borderWidth="1px"
      _hover={{ bg: 'celery--6', borderColor: 'celery--6' }}
      _active={{ bg: 'celery--6', borderWidth: '1px', borderColor: 'celery--5' }}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
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
    </Button>
  );
}
