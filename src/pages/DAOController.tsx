import { Button, Center, Text, VStack, ChakraProvider, extendTheme } from '@chakra-ui/react';
import { theme } from '@decent-org/fractal-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { useAccount } from 'wagmi';
import useDAOController from '../hooks/DAO/useDAOController';
import useDAOMetadata from '../hooks/DAO/useDAOMetadata';
import { useFractal } from '../providers/App/AppProvider';
import { disconnectedChain } from '../providers/NetworkConfig/NetworkConfigProvider';

function InvalidSafe() {
  const { chain } = useAccount();
  const { t } = useTranslation('common');
  return (
    <Center
      padding="3rem"
      textColor="grayscale.100"
    >
      <VStack>
        <Text
          paddingTop="3rem"
          textStyle="text-6xl-mono-regular"
        >
          {t('errorSentryFallbackTitle')}
        </Text>
        <Text>{t('invalidSafe1', { chain: chain ? chain.name : disconnectedChain.name })}</Text>
        <Text paddingBottom="1rem">{t('invalidSafe2')}</Text>
        <Button onClick={() => window.location.reload()}>{t('refresh')}</Button>
      </VStack>
    </Center>
  );
}

export default function DAOController() {
  const { node } = useFractal();
  const { nodeLoading, errorLoading } = useDAOController();
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
  } else if (nodeLoading || validSafe || !errorLoading) {
    display = <Outlet />;
  } else {
    display = <InvalidSafe />;
  }

  return display;
}
