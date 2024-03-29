import { Divider, Flex } from '@chakra-ui/react';
import {
  Home,
  Tree,
  Proposals,
  Treasury,
  SupportQuestion,
  Discord,
  Documents,
  Templates,
} from '@decent-org/fractal-ui';
import { DAO_ROUTES } from '../../../../constants/routes';
import { URL_FAQ, URL_DISCORD, URL_DOCS } from '../../../../constants/url';
import { LanguageSwitcher } from '../../../../i18n/LanguageSwitcher';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { NavigationExternalLink } from './NavigationExternalLink';
import { NavigationLink } from './NavigationLink';

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
    <>
      {showDAOLinks && address && (
        <>
          <Flex
            alignItems={{ base: 'flex-start', md: 'center' }}
            direction="column"
            gap="2rem"
            w="full"
            my={8}
          >
            <NavigationLink
              href={DAO_ROUTES.dao.relative(addressPrefix, address)}
              labelKey="home"
              testId="navigation-daoHomeLink"
              Icon={Home}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.hierarchy.relative(addressPrefix, address)}
              labelKey="nodes"
              testId="navigation-hierarchy"
              Icon={Tree}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.proposals.relative(addressPrefix, address)}
              labelKey="proposals"
              testId="navigation-proposalsLink"
              Icon={Proposals}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.treasury.relative(addressPrefix, address)}
              labelKey="treasury"
              testId="navigation-treasuryLink"
              Icon={Treasury}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.proposalTemplates.relative(addressPrefix, address)}
              labelKey="proposalTemplates"
              testId="navigation-proposalTemplatesLink"
              Icon={Templates}
              closeDrawer={closeDrawer}
            />
          </Flex>
        </>
      )}
      <Flex
        alignItems={{ base: 'flex-start', md: 'center' }}
        direction="column"
        gap="2rem"
        w="full"
        mb={8}
        justifyContent={{ base: 'flex-start' }}
      >
        <Divider color="chocolate.700" />
        <NavigationExternalLink
          href={URL_FAQ}
          ariaLabelKey="ariaLabelFAQ"
          tooltipKey="faq"
          testId="navigationExternal-faq"
          Icon={SupportQuestion}
          closeDrawer={closeDrawer}
        />
        <NavigationExternalLink
          href={URL_DISCORD}
          ariaLabelKey="ariaLabelDiscord"
          tooltipKey="discord"
          testId="navigationExternal-discord"
          Icon={Discord}
          closeDrawer={closeDrawer}
        />
        <NavigationExternalLink
          href={URL_DOCS}
          ariaLabelKey="ariaLabelDocumentation"
          tooltipKey="documentation"
          testId="navigationExternal-documentation"
          Icon={Documents}
          closeDrawer={closeDrawer}
        />

        <Divider color="chocolate.700" />
        <LanguageSwitcher data-testid="navigation-language" />
      </Flex>
    </>
  );
}
