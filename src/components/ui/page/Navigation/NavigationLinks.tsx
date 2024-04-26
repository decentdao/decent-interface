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
import { NavigationExternalLink } from './NavigationExternalLink';
import { NavigationLink } from './NavigationLink';

function ExternalLinks({ closeDrawer }: { closeDrawer?: () => void }) {
  return (
    <Box
      mt={3}
      mb={6}
      maxWidth={{ base: 12, '3xl': '100%' }}
      _hover={{ maxWidth: '100%' }}
      transitionDuration="0.5s"
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
        <NavigationExternalLink
          href={URL_FAQ}
          ariaLabelKey="ariaLabelFAQ"
          tooltipKey="faq"
          testId="navigationExternal-faq"
          Icon={<Question size={24} />}
          closeDrawer={closeDrawer}
        />
        <NavigationExternalLink
          href={URL_DISCORD}
          ariaLabelKey="ariaLabelDiscord"
          tooltipKey="discord"
          testId="navigationExternal-discord"
          Icon={<DiscordLogo size={24} />}
          closeDrawer={closeDrawer}
        />
        <NavigationExternalLink
          href={URL_DOCS}
          ariaLabelKey="ariaLabelDocumentation"
          tooltipKey="documentation"
          testId="navigationExternal-documentation"
          Icon={<BookOpen size={24} />}
          closeDrawer={closeDrawer}
        />
      </Box>
      <Box
        bg="neutral-2"
        pl="11px"
        overflow="hidden"
        borderColor="neutral-3"
        borderWidth={1}
        borderBottomRadius={8}
        pt="10.5px"
        pb="5px"
      >
        <LanguageSwitcher data-testid="navigation-language" />
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
  const { addressPrefix } = useNetworkConfig();

  return (
    <Flex
      alignItems="start"
      direction="column"
      justifyContent="flex-end"
      flexGrow={1}
    >
      {showDAOLinks && address && (
        <Box
          marginY="auto"
          maxWidth={{ base: 12, '3xl': '100%' }}
          _hover={{ maxWidth: '100%' }}
          transitionDuration="0.5s"
        >
          <Box
            mt={12}
            mb={3}
            bg="neutral-2"
            pl="11px"
            overflow="hidden"
            borderColor="neutral-3"
            borderRadius={8}
            borderWidth={1}
          >
            <NavigationLink
              href={DAO_ROUTES.dao.relative(addressPrefix, address)}
              labelKey="home"
              testId="navigation-daoHomeLink"
              Icon={<House size={24} />}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.hierarchy.relative(addressPrefix, address)}
              labelKey="nodes"
              testId="navigation-hierarchy"
              Icon={<GitFork size={24} />}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.proposals.relative(addressPrefix, address)}
              labelKey="proposals"
              testId="navigation-proposalsLink"
              Icon={<Scroll size={24} />}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.treasury.relative(addressPrefix, address)}
              labelKey="treasury"
              testId="navigation-treasuryLink"
              Icon={<Coins size={24} />}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.proposalTemplates.relative(addressPrefix, address)}
              labelKey="proposalTemplates"
              testId="navigation-proposalTemplatesLink"
              Icon={<SquaresFour size={24} />}
              closeDrawer={closeDrawer}
            />
          </Box>
        </Box>
      )}
      <ExternalLinks closeDrawer={closeDrawer} />
    </Flex>
  );
}
