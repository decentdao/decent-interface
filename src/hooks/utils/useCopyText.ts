import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

export function useCopyText() {
  const { t } = useTranslation('common');
  const copyTextToClipboard = (textToCopy?: string) => {
    if (!textToCopy) return;
    toast(t('toastClipboardCopy'), {
      onOpen: () => navigator.clipboard.writeText(textToCopy),
      autoClose: 1000,
    });
  };

  return copyTextToClipboard;
}
