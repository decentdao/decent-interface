import { toast } from 'react-toastify';

export function useCopyText() {
  const copyTextToClipboard = (textToCopy?: string) => {
    if (!textToCopy) return;
    toast('Copied to clipboard', {
      onOpen: () => navigator.clipboard.writeText(textToCopy),
      autoClose: 1000,
    });
  };

  return copyTextToClipboard;
}
