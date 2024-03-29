import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { theme } from '@decent-org/fractal-ui';
import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import useDAOController from '../hooks/DAO/useDAOController';
import useDAOMetadata from '../hooks/DAO/useDAOMetadata';
import { useFractal } from '../providers/App/AppProvider';
import LoadingProblem from './LoadingProblem';

export default function DAOController() {
  const { node } = useFractal();
  const { nodeLoading, errorLoading, wrongNetwork } = useDAOController();
  const daoMetadata = useDAOMetadata();
  const activeTheme = useMemo(() => {
    if (daoMetadata && daoMetadata.bodyBackground) {
      return extendTheme({
        ...theme,
        styles: {
          ...theme.styles,
          global: {
            ...theme.styles.global,
            html: {
              ...theme.styles.global.html,
              background: daoMetadata.bodyBackground,
            },
            body: {
              ...theme.styles.global.body,
              background: 'none',
            },
          },
        },
      });
    }
    return theme;
  }, [daoMetadata]);

  const validSafe = node.safe;
  let display;

  if (import.meta.env.VITE_APP_TESTING_ENVIRONMENT) {
    display = (
      <ChakraProvider theme={activeTheme}>
        <Outlet />
      </ChakraProvider>
    );
  } else if (wrongNetwork) {
    display = <LoadingProblem type="wrongNetwork" />;
  } else if (nodeLoading || validSafe || !errorLoading) {
    display = <Outlet />;
  } else {
    display = <LoadingProblem type="invalidSafe" />;
  }

  return display;
}
