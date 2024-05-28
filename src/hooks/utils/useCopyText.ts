import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

/**
 * Custom hook to copy text to the clipboard.
 * Uses the Clipboard API if available and falls back to a textarea method for older browsers.
 */
export function useCopyText() {
  const { t } = useTranslation('common');


  const copyTextToClipboard = async (textToCopy?: string) => {
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        // Use the Clipboard API if available and the context is secure (HTTPS)
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback method for older browsers (and mobile devices)
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast(t('toastClipboardCopy'), { autoClose: 1000 });
    } catch (error) {
      console.error('Failed to copy text to clipboard: ', error);
      toast(t('toastClipboardCopyError'), { autoClose: 1000 });
    }
  };

  return copyTextToClipboard;
}
