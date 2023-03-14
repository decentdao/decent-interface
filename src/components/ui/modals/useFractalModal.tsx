import { useContext } from 'react';
import { IModalContext, ModalContext, ModalType } from './ModalProvider';

/**
 * Returns a Function intended to be used in a click listener to open the provided ModalType.
 *
 * @param modal the ModalType to open.
 * @param props optional arbitrary key:value properties to pass to the modal
 * @returns a Function that when called opens the provided ModalType modal.
 */
export const useFractalModal = (modal: ModalType, props?: Record<string, any>) => {
  const { setCurrent } = useContext<IModalContext>(ModalContext);
  return () => {
    setCurrent({ type: modal, props: props ? props : [] });
  };
};
