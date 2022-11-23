import { Portal, useDisclosure } from '@chakra-ui/react';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DelegateModal } from './DelegateModal';
import { ModalBase } from './ModalBase';
import { SendAssetsModal } from './SendAssetsModal';

export enum ModalType {
  NONE,
  DELEGATE,
  SEND_ASSETS,
}

export interface CurrentModal {
  current: ModalType;
  setCurrent: Function;
}

export const ModalContext = createContext<CurrentModal>({
  current: ModalType.NONE,
  setCurrent: () => {},
});

interface ModalUI {
  title: string;
  content: ReactNode | null;
  onSetClosed: () => void;
}
/**
 * A provider that handles displaying modals in the app.
 *
 * To add a new modal:
 *  1. Create the modal content as a component, excluding the title of the modal (see e.g. DelegateModal).
 *  2. Add the modal to the ModalType enum.
 *  3. Handle assigning your new modal component for that ModalType here in the provider switch case.
 *  4. Utilize the useFractalModal hook to get a click listener to open your new modal.
 */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ModalType>(ModalType.NONE);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation('modals');
  useEffect(() => {
    if (current != ModalType.NONE) onOpen();
  });

  const { title, content, onSetClosed } = useMemo<ModalUI>(() => {
    const cl = () => {
      setCurrent(ModalType.NONE);
      onClose();
    };
    let ti;
    let co;
    switch (current) {
      case ModalType.DELEGATE:
        ti = t('delegateTitle');
        co = <DelegateModal close={cl} />;
        break;
      case ModalType.SEND_ASSETS:
        ti = t('sendAssetsTitle');
        co = <SendAssetsModal close={cl} />;
        break;
      case ModalType.NONE:
      default:
        ti = '';
        co = null;
    }
    return { title: ti, content: co, onSetClosed: cl };
  }, [current, onClose, t]);

  const display = content ? (
    <ModalBase
      title={title}
      isOpen={isOpen}
      onClose={onSetClosed}
    >
      {content}
    </ModalBase>
  ) : null;

  return (
    <ModalContext.Provider value={{ current, setCurrent }}>
      {children}
      <Portal>{display}</Portal>
    </ModalContext.Provider>
  );
}
