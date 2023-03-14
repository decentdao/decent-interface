import { IconButton } from '@chakra-ui/react';
import { Copy } from '@decent-org/fractal-ui';
import { toast } from 'react-toastify';

function CopyToClipboard({
  textToCopy,
  ariaLabel = 'copy text',
}: {
  ariaLabel?: string;
  textToCopy: string | undefined | null;
}) {
  const copyTextToClipboard = () => {
    if (!textToCopy) return;
    toast('Copied to clipboard', {
      onOpen: () => navigator.clipboard.writeText(textToCopy),
      autoClose: 1000,
    });
  };
  return (
    <IconButton
      aria-label={ariaLabel}
      icon={<Copy />}
      variant="unstyled"
      minWidth="auto"
      onClick={copyTextToClipboard}
    />
  );
}

export default CopyToClipboard;
