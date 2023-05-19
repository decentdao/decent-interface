'use client';

import { Center, VStack, Text, Button, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppFooter } from '../src/components/pages/AppHome/AppFooter';
import { CTABox } from '../src/components/pages/AppHome/CTABox';
import FeaturedDAOCard from '../src/components/pages/AppHome/FeaturedDAOCard';
import ValueProposition from '../src/components/pages/AppHome/ValueProposition';
import ExternalLink from '../src/components/ui/links/ExternalLink';
import ClientOnly from '../src/components/ui/utils/ClientOnly';
import { BASE_ROUTES } from '../src/constants/routes';
import { URL_DOCS } from '../src/constants/url';
import { useFractal } from '../src/providers/App/AppProvider';

const VALUE_PROPS = [
  {
    iconSrc: '/images/icon-govern.svg',
    titleKey: 'govern',
    descKey: 'governDesc',
  },
  {
    iconSrc: '/images/icon-mint.svg',
    titleKey: 'mint',
    descKey: 'mintDesc',
  },
  {
    iconSrc: '/images/icon-launch.svg',
    titleKey: 'launch',
    descKey: 'launchDesc',
  },
];

const FEATURED_DAOS = [
  {
    iconSrc: '/images/icon-decent.svg',
    titleKey: 'decentTitle',
    descKey: 'decentDesc',
    address: '0x8202E3cBa328CCf3eeA5bF0A11596c5297Cf7525', // TODO
  },
  {
    iconSrc: '/images/icon-awakevc.svg',
    titleKey: 'awakeTitle',
    descKey: 'awakeDesc',
    address: '0xF2C7C6445BD4E2d79e0Ee362812BaDD8D227b02F', // TODO
  },
];

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
            alignSelf="center"
            paddingBottom="1.5rem"
            textStyle={{ md: 'text-6xl-mono-regular', sm: 'text-4xl-mono-regular' }}
            color="grayscale.100"
          >
            {t('homeTitle')}
          </Text>
          <Text
            alignSelf="center"
            textAlign="center"
            maxWidth="49rem"
            paddingBottom="4rem"
            textStyle="text-lg-mono-regular"
            color="grayscale.300"
          >
            {t('homeDesc')}
          </Text>
          <Flex
            paddingBottom="2rem"
            flexWrap="wrap"
          >
            {VALUE_PROPS.map(daoAction => {
              return (
                <ValueProposition
                  paddingBottom="2rem"
                  width={{ md: '100%', lg: '33%' }}
                  key={daoAction.titleKey}
                  iconSrc={daoAction.iconSrc}
                  title={t(daoAction.titleKey)}
                  desc={t(daoAction.descKey)}
                  paddingEnd={
                    daoAction.titleKey !== VALUE_PROPS[VALUE_PROPS.length - 1].titleKey
                      ? '2rem'
                      : '0rem'
                  }
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
            {FEATURED_DAOS.map(feature => {
              return (
                <FeaturedDAOCard
                  width={{ sm: '100%', md: '50%' }}
                  key={feature.titleKey}
                  iconSrc={feature.iconSrc}
                  title={t(feature.titleKey)}
                  desc={t(feature.descKey)}
                  address={feature.address}
                  marginBottom="2rem"
                  // marginEnd={
                  //   feature.titleKey !== DAO_FEATURES[DAO_FEATURES.length - 1].titleKey
                  //     ? '1.125rem'
                  //     : '0rem'
                  // }
                />
              );
            })}
          </Flex>
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
