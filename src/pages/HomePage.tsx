import { VStack, Text, Flex, Box, HStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { mainnet, sepolia } from 'wagmi/chains';
import { AppFooter } from '../components/pages/AppHome/AppFooter';
import FeaturedDAOCard, { FeaturedDAO } from '../components/pages/AppHome/FeaturedDAOCard';
import { CreateDAOIllustration, DocsIllustration } from '../components/ui/proposal/Icons';
import { BASE_ROUTES } from '../constants/routes';
import { URL_DOCS } from '../constants/url';
import { useFractal } from '../providers/App/AppProvider';
import { useNetworkConfig } from '../providers/NetworkConfig/NetworkConfigProvider';

// featured DAOs are dependent on the connected chain
const FEATURED_DAOS = new Map<number, FeaturedDAO[]>([
  [
    mainnet.id,
    [
      {
        iconSrc: '/images/icon-decent.png',
        iconRounded: true,
        titleKey: 'decentTitle',
        network: 'eth',
        networkName: 'Ethereum',
        votingStrategy: 'Multisig',
        address: '0xD26c85D435F02DaB8B220cd4D2d398f6f646e235',
      },
      {
        iconSrc: '/images/shutter-icon-only-logo.svg',
        iconBg: 'neutral-3',
        titleKey: 'shutterTitle',
        network: 'eth',
        networkName: 'Ethereum',
        votingStrategy: 'ERC-20',
        address: '0x36bD3044ab68f600f6d3e081056F34f2a58432c4',
      },
      {
        iconSrc: '/images/icon-awakevc.svg',
        titleKey: 'awakeTitle',
        iconBg: 'neutral-3',
        network: 'eth',
        networkName: 'Ethereum',
        votingStrategy: 'Multisig',
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
        network: 'sep',
        networkName: 'Sepolia',
        votingStrategy: 'ERC-20',
        address: '0xdef90A94273a1A1A72B33D39129fa41E6C08Be3a',
      },
    ],
  ],
]);

export default function HomePage() {
  const { t } = useTranslation('home');
  const {
    node: { daoAddress },
    action,
  } = useFractal();

  useEffect(() => {
    if (daoAddress) {
      action.resetDAO();
    }
  }, [daoAddress, action]);

  const { chain } = useNetworkConfig();
  const featuredDaos = FEATURED_DAOS.get(chain.id);

  return (
    <Flex flexWrap="wrap">
      <VStack
        flex="1"
        alignItems="start"
        pt="3rem"
        px="1.5rem"
      >
        <Text textStyle="display-xl">{t('homeTitle')}</Text>
        <HStack
          mt="1.5rem"
          gap="1.5rem"
          w="full"
        >
          <Flex
            gap="3rem"
            bg="lilac-0"
            px="1.5rem"
            w="50%"
            h="10rem"
            overflow="hidden"
            alignItems="center"
            borderRadius={8}
            as={Link}
            to={BASE_ROUTES.create}
          >
            <Box width="50%">
              <Text
                textStyle="display-2xl"
                color="cosmic-nebula-0"
              >
                {t('createCTA')}
              </Text>
              <Text color="cosmic-nebula-0">{t('createDesc')}</Text>
            </Box>
            <Box width="50%">
              <CreateDAOIllustration />
            </Box>
          </Flex>
          <Flex
            gap="3rem"
            bg="neutral-3"
            pl="1.5rem"
            w="50%"
            h="10rem"
            overflow="hidden"
            alignItems="center"
            borderRadius={8}
            as={Link}
            to={URL_DOCS}
            target="_blank"
          >
            <Box width="50%">
              <Text textStyle="display-2xl">{t('docsCTA')}</Text>
              <Text color="neutral-7">{t('docsDesc')}</Text>
            </Box>
            <Flex
              width="50%"
              justifyContent="flex-end"
            >
              <DocsIllustration />
            </Flex>
          </Flex>
        </HStack>
        {featuredDaos && featuredDaos.length > 0 ? (
          <VStack
            alignItems="flex-start"
            mt="4rem"
            w="full"
          >
            <Text textStyle="display-xl">{t('featuredTitle')}</Text>
            <Flex
              flexWrap="wrap"
              gap="1.5rem"
              mt="1.5rem"
              w="full"
            >
              {featuredDaos.map(dao => (
                <FeaturedDAOCard
                  key={dao.titleKey}
                  item={dao}
                />
              ))}
            </Flex>
          </VStack>
        ) : (
          // if there are no features just show padding
          <Box h="2rem" />
        )}
      </VStack>
      <AppFooter />
    </Flex>
  );
}
