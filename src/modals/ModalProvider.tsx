import { Portal } from '@chakra-ui/react';
import { createContext, ReactNode, useState } from 'react';

export interface ModalState {
  value: ReactNode;
  setValue: Function;
}

export const ModalContext = createContext<ModalState>({ value: null, setValue: () => {} });

export function ModalProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<ReactNode>(null);
  return (
    <ModalContext.Provider value={{ value, setValue }}>
      {children}
      <Portal>{value}</Portal>
    </ModalContext.Provider>
  );
}
