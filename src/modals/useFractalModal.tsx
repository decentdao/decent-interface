import { useContext } from 'react';
import { CurrentModal, ModalContext, ModalType } from './ModalProvider';

export const useFractalModal = (modal: ModalType) => {
  const { setCurrent } = useContext<CurrentModal>(ModalContext);
  return () => {
    setCurrent(modal);
  };
};
