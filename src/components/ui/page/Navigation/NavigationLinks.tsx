import { Box, Flex, Hide } from '@chakra-ui/react';
import {
  House,
  GitFork,
  Scroll,
  Coins,
  SquaresFour,
  Question,
  DiscordLogo,
  BookOpen,
} from '@phosphor-icons/react';
import { DAO_ROUTES } from '../../../../constants/routes';
import { URL_FAQ, URL_DISCORD, URL_DOCS } from '../../../../constants/url';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import Divider from '../../utils/Divider';
import { NavigationLink } from './NavigationLink';

function ExternalLinks({ closeDrawer }: { closeDrawer?: () => void }) {
  return (
    <Box
      mb={6}
      mt={{ base: 0, md: 6 }}
      maxWidth={{ md: 12, '3xl': '100%' }}
      _hover={{ maxWidth: '100%' }}
      transitionDuration="0.2s"
      width={{ base: 'full', md: 'auto' }}
      borderRadius={{ md: 8 }}
      borderWidth={{ md: 1 }}
      borderColor={{ md: 'neutral-3' }}
      bg={{ md: 'neutral-2' }}
      overflow={{ md: 'hidden' }}
    >
      <NavigationLink
        href={URL_FAQ}
        labelKey="faq"
        testId="navigationExternal-faq"
        NavigationIcon={Question}
        scope="external"
        closeDrawer={closeDrawer}
      />
      <NavigationLink
        href={URL_DISCORD}
        labelKey="discord"
        testId="navigationExternal-discord"
        NavigationIcon={DiscordLogo}
        scope="external"
        closeDrawer={closeDrawer}
      />
      <NavigationLink
        href={URL_DOCS}
        labelKey="documentation"
        testId="navigationExternal-documentation"
        NavigationIcon={BookOpen}
        scope="external"
        closeDrawer={closeDrawer}
      />
    </Box>
  );
}

function InternalLinks({
  address,
  showDAOLinks,
  closeDrawer,
}: {
  address: string | null;
  showDAOLinks: boolean;
  closeDrawer?: () => void;
}) {
  const { addressPrefix } = useNetworkConfig();

  if (!showDAOLinks || !address) {
    return null;
  }

  return (
    <Box
      width="full"
      marginY="auto"
    >
      <Box
        maxWidth={{ md: 12, '3xl': '100%' }}
        _hover={{ maxWidth: '100%' }}
        transitionDuration="0.2s"
        overflow={{ md: 'hidden' }}
        mt={{ md: 12 }}
        mb={{ md: 3 }}
        bg={{ md: '#26212AD6' }}
        borderColor={{ md: 'neutral-3' }}
        borderRadius={{ md: 8 }}
        borderWidth={{ md: 1 }}
        backdropFilter="blur(12px)"
        boxShadow="0px 1px 0px 0px #161219"
      >
        <NavigationLink
          href={DAO_ROUTES.dao.relative(addressPrefix, address)}
          labelKey="home"
          testId="navigation-daoHomeLink"
          NavigationIcon={House}
          scope="internal"
          closeDrawer={closeDrawer}
        />
        <NavigationLink
          href={DAO_ROUTES.hierarchy.relative(addressPrefix, address)}
          labelKey="nodes"
          testId="navigation-hierarchy"
          NavigationIcon={GitFork}
          scope="internal"
          closeDrawer={closeDrawer}
        />
        <NavigationLink
          href={DAO_ROUTES.proposals.relative(addressPrefix, address)}
          labelKey="proposals"
          testId="navigation-proposalsLink"
          NavigationIcon={Scroll}
          scope="internal"
          closeDrawer={closeDrawer}
        />
        <NavigationLink
          href={DAO_ROUTES.treasury.relative(addressPrefix, address)}
          labelKey="treasury"
          testId="navigation-treasuryLink"
          NavigationIcon={Coins}
          scope="internal"
          closeDrawer={closeDrawer}
        />
        <NavigationLink
          href={DAO_ROUTES.proposalTemplates.relative(addressPrefix, address)}
          labelKey="proposalTemplates"
          testId="navigation-proposalTemplatesLink"
          NavigationIcon={SquaresFour}
          scope="internal"
          closeDrawer={closeDrawer}
        />
        <Hide above="md">
          <Divider mx={-6} />
        </Hide>
      </Box>
    </Box>
  );
}

export function NavigationLinks({
  address,
  showDAOLinks,
  closeDrawer,
}: {
  showDAOLinks: boolean;
  address: string | null;
  closeDrawer?: () => void;
}) {
  return (
    <Flex
      alignItems="start"
      direction="column"
      justifyContent="flex-end"
      flexGrow={1}
    >
      <InternalLinks
        address={address}
        showDAOLinks={showDAOLinks}
        closeDrawer={closeDrawer}
      />
      <ExternalLinks closeDrawer={closeDrawer} />
    </Flex>
  );
}
