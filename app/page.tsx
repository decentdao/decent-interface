'use client';

import { Center, VStack, Text, Button, Flex, Box } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetwork } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { AppFooter } from '../src/components/pages/AppHome/AppFooter';
import { CTABox } from '../src/components/pages/AppHome/CTABox';
import FeaturedDAOCard from '../src/components/pages/AppHome/FeaturedDAOCard';
import ValueProposition from '../src/components/pages/AppHome/ValueProposition';
import ExternalLink from '../src/components/ui/links/ExternalLink';
import ClientOnly from '../src/components/ui/utils/ClientOnly';
import { BASE_ROUTES } from '../src/constants/routes';
import { URL_DOCS } from '../src/constants/url';
import ethLizardsLogo from '../src/metadata/lizzardsDAO/assets/logo.png';
import { useFractal } from '../src/providers/App/AppProvider';
import { disconnectedChain } from '../src/providers/NetworkConfig/NetworkConfigProvider';

const VALUE_PROPS = [
  {
    iconSrc: '/images/icon-structure.svg',
    titleKey: 'structure',
    descKey: 'structureDesc',
  },
  {
    iconSrc: '/images/icon-operate.svg',
    titleKey: 'operate',
    descKey: 'operateDesc',
  },
  {
    iconSrc: '/images/icon-govern.svg',
    titleKey: 'govern',
    descKey: 'governDesc',
  },
];

interface Feature {
  iconSrc: string;
  titleKey: string;
  descKey: string;
  address: string;
}

// featured DAOs are dependent on the connected chain
const FEATURED_DAOS = new Map<number, Feature[]>([
  [
    mainnet.id,
    [
      {
        iconSrc: '/images/shutter-icon-only-logo.svg',
        titleKey: 'shutterTitle',
        descKey: 'shutterDesc',
        address: '0x36bD3044ab68f600f6d3e081056F34f2a58432c4',
      },
      {
        iconSrc: '/images/icon-decent.svg',
        titleKey: 'decentTitle',
        descKey: 'decentDesc',
        address: '0xD26c85D435F02DaB8B220cd4D2d398f6f646e235',
      },
      {
        iconSrc: '/images/icon-awakevc.svg',
        titleKey: 'awakeTitle',
        descKey: 'awakeDesc',
        address: '0xdD6CeFA62239272f1eDf755ba6471eacb7DF2Fa5',
      },
    ],
  ],
  [
    sepolia.id,
    [
      {
        iconSrc: '/images/icon-myosin.svg',
        titleKey: 'myosinTitle',
        descKey: 'myosinDesc',
        address: '0xdef90A94273a1A1A72B33D39129fa41E6C08Be3a',
      },
    ],
  ],
]);

export default function HomePage() {
  const { t } = useTranslation('home');
  const { push } = useRouter();
  const createDAO = () => {
    push(BASE_ROUTES.create);
  };
  const {
    node: { daoAddress },
    action,
  } = useFractal();

  useEffect(() => {
    if (daoAddress) {
      action.resetDAO();
    }
  }, [daoAddress, action]);

  const { chain } = useNetwork();
  const features = FEATURED_DAOS.get(chain ? chain.id : disconnectedChain.id);

  return (
    <ClientOnly>
      <Center>
        <VStack
          maxW={{ md: '80%', sm: '95%' }}
          alignItems="start"
          paddingTop="6.25rem"
          paddingBottom="6.25rem"
        >
          <Text
            paddingBottom="1.5rem"
            textStyle={{
              base: 'text-2xl-mono-regular',
              sm: 'text-4xl-mono-regular',
              md: 'text-6xl-mono-regular',
            }}
            color="grayscale.100"
          >
            {t('homeTitle')}
          </Text>
          <Center>
            <Flex
              paddingBottom="2rem"
              alignItems="center"
              flexWrap="wrap"
            >
              <Text
                width={{ md: '100%', lg: '65%' }}
                textStyle="text-lg-mono-regular"
                color="grayscale.300"
                paddingEnd="1rem"
                marginBottom="2rem"
              >
                {t('homeDesc')}
              </Text>
              <Button
                width={{ md: '100%', lg: '35%' }}
                h="3.5rem"
                onClick={createDAO}
                variant="tertiary"
                marginBottom="2rem"
              >
                {t('createButton')}
              </Button>
            </Flex>
          </Center>
          <Flex
            paddingBottom="2rem"
            flexWrap="wrap"
          >
            {VALUE_PROPS.map((daoAction, index) => {
              return (
                <ValueProposition
                  paddingBottom="2rem"
                  width={{ md: '100%', lg: '33%' }}
                  key={daoAction.titleKey}
                  iconSrc={daoAction.iconSrc}
                  title={t(daoAction.titleKey)}
                  desc={t(daoAction.descKey)}
                  paddingEnd={index !== VALUE_PROPS.length - 1 ? '2rem' : '0rem'}
                />
              );
            })}
          </Flex>
          <CTABox
            leftSlot={
              <ExternalLink href={URL_DOCS}>
                <Button>{t('getStartedButton')}</Button>
              </ExternalLink>
            }
            rightSlot={
              <Text
                textStyle="text-xl-mono-bold"
                color="chocolate.100"
              >
                {t('learnCTA')}
              </Text>
            }
          />
          {features && features.length > 0 ? (
            <>
              <Text
                paddingTop="3.5rem"
                textStyle="text-lg-mono-bold"
                color="grayscale.100"
              >
                {t('featuredTitle')}
              </Text>
              <Text
                color="grayscale.500"
                paddingBottom="1.5rem"
              >
                {t('featuredDesc')}
              </Text>
              <Flex
                flexWrap="wrap"
                paddingBottom="1.5rem"
              >
                {features.map((feature, index) => {
                  if (
                    typeof location !== 'undefined' &&
                    location.pathname === 'app.fractalframework.xyz'
                  ) {
                    return null;
                  }
                  return (
                    <FeaturedDAOCard
                      width={{ sm: '100%', lg: '50%' }}
                      key={feature.titleKey}
                      iconSrc={feature.iconSrc}
                      title={t(feature.titleKey)}
                      desc={t(feature.descKey)}
                      address={feature.address}
                      marginBottom="2rem"
                      paddingEnd={{ sm: '0rem', lg: index % 2 === 0 ? '0.56rem' : '0rem' }}
                      paddingStart={{ sm: '0rem', lg: index % 2 === 1 ? '0.56rem' : '0rem' }}
                    />
                  );
                })}
              </Flex>
            </>
          ) : (
            // if there are no features just show padding
            <Box h="2rem"></Box>
          )}
          <CTABox
            leftSlot={
              <Text
                textStyle="text-xl-mono-bold"
                color="chocolate.100"
              >
                {t('readyCTA')}
              </Text>
            }
            rightSlot={
              <Button
                data-testid="home-linkCreate"
                h="3.5rem"
                onClick={createDAO}
                variant="tertiary"
              >
                {t('createButton')}
              </Button>
            }
          />
          <AppFooter />
        </VStack>
      </Center>
    </ClientOnly>
  );
}
