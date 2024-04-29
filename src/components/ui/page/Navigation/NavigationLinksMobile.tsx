import { Box } from '@chakra-ui/react';
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
      mb={6}
      width="full"
    >
      <Box>
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
        borderTop="1px"
        borderColor="neutral-3"
        mx={-6}
      />
      <Box pt={3}>
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
    <Box width="full">
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
      <Box
        borderTop="1px"
        borderColor="neutral-3"
        mx={-6}
      />
    </Box>
  );
}

export function NavigationLinksMobile({
  address,
  showDAOLinks,
  closeDrawer,
}: {
  showDAOLinks: boolean;
  address: string | null;
  closeDrawer?: () => void;
}) {
  return (
    <>
      <InternalLinks
        address={address}
        showDAOLinks={showDAOLinks}
        closeDrawer={closeDrawer}
      />
      <ExternalLinks closeDrawer={closeDrawer} />
    </>
  );
}
