import { Box, Flex } from '@chakra-ui/react';
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
import { LanguageSwitcher } from '../../../../i18n/LanguageSwitcher';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { NavigationLink } from './NavigationLink';

function ExternalLinks({ closeDrawer }: { closeDrawer?: () => void }) {
  return (
    <Box
      mt={3}
      mb={6}
      maxWidth={{ base: 12, '3xl': '100%' }}
      _hover={{ maxWidth: '100%' }}
      transitionDuration="0.2s"
    >
      <Box
        bg="neutral-2"
        pl="11px"
        overflow="hidden"
        borderColor="neutral-3"
        mb="1px"
        borderTopRadius={8}
        borderTopWidth={1}
        borderLeftWidth={1}
        borderRightWidth={1}
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
      <Box
        bg="neutral-2"
        overflow="hidden"
        borderColor="neutral-3"
        borderWidth={1}
        borderBottomRadius={8}
        pl="11px"
        pt="11px"
        pb="4px"
      >
        <LanguageSwitcher data-testid="navigation-language" />
      </Box>
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
    <Box marginY="auto">
      <Box
        maxWidth={{ base: 12, '3xl': '100%' }}
        _hover={{ maxWidth: '100%' }}
        transitionDuration="0.2s"
        mt={12}
        mb={3}
        pl="11px"
        bg="neutral-2"
        overflow="hidden"
        borderColor="neutral-3"
        borderRadius={8}
        borderWidth={1}
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
      </Box>
    </Box>
  );
}

export function NavigationLinksSidebar({
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
