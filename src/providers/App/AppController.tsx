import { Box } from '@chakra-ui/react';
import { ReactNode } from 'react';

export function AppController({ children }: { children: ReactNode }) {
  // This new layer will be used to control the app state without re-rendering the whole app.
  // I believe that by extracts this part below the useMemo of the provider will allow for better more intentional loading
  return children;
}
