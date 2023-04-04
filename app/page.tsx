'use client';

import { Link } from '@chakra-ui/next-js';
import { Box, Center, Flex, HStack, Text, Button } from '@chakra-ui/react';
import { Discord, Documents, SupportQuestion } from '@decent-org/fractal-ui';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import packageJson from '../package.json';
import { BASE_ROUTES } from '../src/constants/routes';
import { URL_DISCORD, URL_DOCS, URL_FAQ } from '../src/constants/url';
import useClientSide from '../src/hooks/utils/useClientSide';
import { useFractal } from '../src/providers/App/AppProvider';

interface IconWithTextProps {
  icon: ReactNode;
  label: string;
  url: string;
  testid: string;
}

function IconWithText({ icon, label, url, testid }: IconWithTextProps) {
  return (
    <Link
      data-testid={testid}
      href={url}
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
    </Link>
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

export default function HomePage() {
  const isClientSide = useClientSide();
  const { t } = useTranslation('daoCreate');
  const { address: account } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { push } = useRouter();
  const createDAO = () => {
    push(BASE_ROUTES.create);
  };

  const {
    node: { daoAddress },
    dispatch,
  } = useFractal();

  useEffect(() => {
    if (daoAddress) {
      dispatch.resetDAO();
    }
  }, [daoAddress, dispatch]);
  return (
    <Center h="full">
      <Flex
        flexDirection="column"
        alignItems="center"
      >
        <Box marginBottom="3.5rem">
          <NextImage
            priority
            width={252}
            height={48}
            src="/images/fractal-text-logo.svg"
            alt="Fractal Logo"
          />
        </Box>
        {!account && isClientSide && (
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
          data-testid={
            isClientSide && account ? 'home-pageSubtitleConnected' : 'home-pageSubtitleDisconnected'
          }
          textStyle="text-base-mono-regular"
          color="grayscale.100"
          marginBottom="1.5rem"
        >
          {t(isClientSide && account ? 'homeSubTitleConnected' : 'homeSubTitleDisconnected')}
        </Text>
        <Button
          onClick={isClientSide && account ? createDAO : openConnectModal}
          data-testid={isClientSide && account ? 'home-linkCreate' : 'home-linkConnect'}
          size="lg"
          marginBottom="3.25rem"
        >
          {t(account && isClientSide ? 'homeButtonCreate' : 'homeButtonConnect')}
        </Button>
        <InfoLinks />
        <Link
          marginTop="2rem"
          href="https://www.netlify.com/"
          target="_blank"
        >
          <Text
            textStyle="text-md-mono-semibold"
            color="gold.500"
          >
            v{packageJson.version} Deployed by Netlify
          </Text>
        </Link>
      </Flex>
    </Center>
  );
}
