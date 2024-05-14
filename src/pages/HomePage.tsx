import { VStack, Text, Flex, Button } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mainnet, sepolia } from 'wagmi/chains';
import CTABox from '../components/pages/AppHome/CTABox';
import FeaturedDAOCard, { FeaturedDAO } from '../components/pages/AppHome/FeaturedDAOCard';
import { CreateDAOIllustration, DocsIllustration } from '../components/ui/icons/Icons';
import { CONTENT_MAXW } from '../constants/common';
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
        iconBg: 'neutral-3',
        network: 'sep',
        networkName: 'Sepolia',
        votingStrategy: 'ERC-20',
        address: '0xdef90A94273a1A1A72B33D39129fa41E6C08Be3a',
      },
    ],
  ],
]);

export default function HomePage() {
  const [shownItemsCount, setShownItemsCount] = useState(4);
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
        maxW={CONTENT_MAXW}
        flex="1"
        alignItems="start"
        pt="3rem"
        px="1.5rem"
      >
        <Text textStyle="display-xl">{t('homeTitle')}</Text>
        <Flex
          mt="1.5rem"
          gap="1.5rem"
          w="full"
          flexWrap="wrap"
        >
          <CTABox
            titleKey="createCTA"
            descKey="createDesc"
            to={BASE_ROUTES.create}
            Icon={<CreateDAOIllustration />}
            titleColor="cosmic-nebula-0"
            descColor="cosmic-nebula-0"
            bg="lilac-0"
          />
          <CTABox
            to={URL_DOCS}
            target="_blank"
            titleKey="docsCTA"
            descKey="docsDesc"
            Icon={<DocsIllustration />}
            pr={0}
            iconContainerJustify="flex-end"
          />
        </Flex>
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
              {featuredDaos.slice(0, shownItemsCount).map(dao => (
                <FeaturedDAOCard
                  key={dao.titleKey}
                  {...dao}
                />
              ))}
            </Flex>
            {featuredDaos.length > shownItemsCount && (
              <Flex
                w="full"
                justifyContent="center"
                mt="2.5rem"
              >
                {/* @todo This is supposed to be themed button but it seems like this is only instance of it in the app. Either keep it as is or style properly through Chakra theming */}
                <Button
                  variant="tertiary"
                  borderRadius="625rem"
                  bg="neutral-3"
                  py="0.25rem"
                  px="0.75rem"
                  onClick={() => setShownItemsCount(prevState => prevState + 4)}
                >
                  {t('textMoreDAOs')}
                </Button>
              </Flex>
            )}
          </VStack>
        ) : null}
      </VStack>
    </Flex>
  );
}
