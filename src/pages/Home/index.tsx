import { Box, Center, Flex, HStack, Text } from '@chakra-ui/react';
import { Button, Discord, Documents, SupportQuestion } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DAO_ROUTES } from '../../routes/constants';
import { ReactComponent as Logo } from '../../assets/images/fractal-text-logo.svg';
import { URL_DISCORD, URL_DOCS, URL_FAQ } from '../../components/constants';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import { ReactNode } from 'react';

interface IconWithTextProps {
  icon: ReactNode;
  label: string;
  url: string;
  testid: string;
}

function IconWithText({ icon, label, url, testid }: IconWithTextProps) {
  return (
    <a
      data-testid={testid}
      href={url}
      rel="noreferrer noopener"
      target="_blank"
    >
      <HStack>
        {icon}
        <Text
          textStyle="text-button-md-semibold"
          color="gold.500"
        >
          {label}
        </Text>
      </HStack>
    </a>
  );
}

function InfoLinks() {
  const { t } = useTranslation('menu');
  return (
    <HStack>
      <IconWithText
        icon={
          <SupportQuestion
            color="gold.500"
            boxSize="1.5rem"
          />
        }
        label={t('faq')}
        url={URL_FAQ}
        testid="home-linkFAQ"
      />
      <Box
        paddingLeft="1.25rem"
        paddingRight="1.25rem"
      >
        <IconWithText
          icon={
            <Discord
              color="gold.500"
              boxSize="1.5rem"
            />
          }
          label={t('discord')}
          url={URL_DISCORD}
          testid="home-linkDiscord"
        />
      </Box>
      <IconWithText
        icon={
          <Documents
            color="gold.500"
            boxSize="1.5rem"
          />
        }
        label={t('docs')}
        url={URL_DOCS}
        testid="home-linkDocs"
      />
    </HStack>
  );
}

function Home() {
  const { t } = useTranslation('daoCreate');
  const {
    state: { account },
    connect,
  } = useWeb3Provider();
  const navigate = useNavigate();
  const createDAO = () => {
    navigate(DAO_ROUTES.new.relative);
  };
  return (
    <Center h="100vh">
      <Flex
        flexDirection="column"
        alignItems="center"
      >
        <Logo style={{ marginBottom: '3.5rem' }} />
        {!account && (
          <Text
            data-testid="home-pageTitleDisconnected"
            textStyle="text-2xl-mono-regular"
            color="grayscale.100"
            marginBottom="1.5rem"
          >
            {t('homeTitleDisconnected')}
          </Text>
        )}
        <Text
          data-testid={account ? 'home-pageSubtitleConnected' : 'home-pageSubtitleDisconnected'}
          textStyle="text-base-mono-regular"
          color="grayscale.100"
          marginBottom="1.5rem"
        >
          {account ? t('homeSubTitleConnected') : t('homeSubTitleDisconnected')}
        </Text>
        <Button
          onClick={account ? createDAO : connect}
          data-testid={account ? 'home-linkCreate' : 'home-linkConnect'}
          size="lg"
          marginBottom="3.25rem"
        >
          {account ? t('homeButtonCreate') : t('homeButtonConnect')}
        </Button>
        <InfoLinks />
      </Flex>
    </Center>
  );
}

export default Home;
