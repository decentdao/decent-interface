import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { theme } from '@decent-org/fractal-ui';
import { useEffect, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import useDAOController from '../hooks/DAO/useDAOController';
import useDAOMetadata from '../hooks/DAO/useDAOMetadata';
import { useFractal } from '../providers/App/AppProvider';
import LoadingProblem from './LoadingProblem';

export default function DAOController() {
  const { errorLoading, wrongNetwork, invalidQuery } = useDAOController();
  const {
    node: { daoName },
  } = useFractal();
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

  useEffect(() => {
    if (daoName) {
      document.title = `${import.meta.env.VITE_APP_NAME} | ${daoName}`;
    }

    return () => {
      document.title = import.meta.env.VITE_APP_NAME;
    };
  }, [daoName]);

  let display;

  if (import.meta.env.VITE_APP_TESTING_ENVIRONMENT) {
    display = (
      <ChakraProvider theme={activeTheme}>
        <Outlet />
      </ChakraProvider>
    );
    // the order of the if blocks of these next three error states matters
  } else if (invalidQuery) {
    display = <LoadingProblem type="badQueryParam" />;
  } else if (wrongNetwork) {
    display = <LoadingProblem type="wrongNetwork" />;
  } else if (errorLoading) {
    display = <LoadingProblem type="invalidSafe" />;
  } else {
    display = <Outlet />;
  }

  return display;
}
