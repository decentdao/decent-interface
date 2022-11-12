import { Portal, useDisclosure } from '@chakra-ui/react';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DelegateModal } from './DelegateModal';
import { FractalModalBase } from './FractalModalBase';

export enum ModalType {
  NONE,
  DELEGATE,
}

export interface CurrentModal {
  current: ModalType;
  setCurrent: Function;
}

export const ModalContext = createContext<CurrentModal>({
  current: ModalType.NONE,
  setCurrent: () => {},
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ModalType>(ModalType.NONE);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation('delegate'); // TODO split titles into their own namespaces?
  useEffect(() => {
    if (current != ModalType.NONE) onOpen();
  });
  const onSetClosed = () => {
    setCurrent(ModalType.NONE);
    onClose();
  };

  let title;
  let content;
  switch (current) {
    case ModalType.DELEGATE:
      title = t('delegateTitle');
      content = <DelegateModal close={onSetClosed} />;
      break;
    case ModalType.NONE:
    default:
      title = '';
      content = null;
  }

  const display = content ? (
    <FractalModalBase
      title={title}
      isOpen={isOpen}
      onClose={onSetClosed}
    >
      {content}
    </FractalModalBase>
  ) : (
    <></>
  );

  return (
    <ModalContext.Provider value={{ current, setCurrent }}>
      {children}
      <Portal>{display}</Portal>
    </ModalContext.Provider>
  );
}
