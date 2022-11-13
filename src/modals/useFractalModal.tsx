import { useContext } from 'react';
import { CurrentModal, ModalContext, ModalType } from './ModalProvider';

/**
 * Returns a Function intended to be used in a click listener to open the provided ModalType.
 *
 * @param modal the ModalType to open.
 * @returns a Function that when called opens the provided ModalType modal.
 */
export const useFractalModal = (modal: ModalType) => {
  const { setCurrent } = useContext<CurrentModal>(ModalContext);
  return () => {
    setCurrent(modal);
  };
};
