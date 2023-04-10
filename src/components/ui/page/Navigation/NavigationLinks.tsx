import { Divider, Flex } from '@chakra-ui/react';
import {
  Home,
  Tree,
  Proposals,
  Treasury,
  SupportQuestion,
  Discord,
  Documents,
  Integrations,
} from '@decent-org/fractal-ui';
import { DAO_ROUTES } from '../../../../constants/routes';
import { URL_FAQ, URL_DISCORD, URL_DOCS } from '../../../../constants/url';
import { LanguageSwitcher } from '../../../../i18n/LanguageSwitcher';
import { NavigationExternalLink } from './NavigationExternalLink';
import { NavigationLink } from './NavigationLink';

export function NavigationLinks({
  address,
  showDAOLinks,
  closeDrawer,
}: {
  showDAOLinks: boolean;
  address?: string;
  closeDrawer?: () => void;
}) {
  return (
    <>
      {showDAOLinks && (
        <>
          <Flex
            alignItems={{ base: 'flex-start', md: 'center' }}
            direction="column"
            gap="2rem"
            w="full"
            my={8}
          >
            <NavigationLink
              href={DAO_ROUTES.dao.relative(address)}
              labelKey="home"
              testId="navigation-daoHomeLink"
              Icon={Home}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.hierarchy.relative(address)}
              labelKey="nodes"
              testId="navigation-hierarchy"
              Icon={Tree}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.proposals.relative(address)}
              labelKey="proposals"
              testId="navigation-proposalsLink"
              Icon={Proposals}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.treasury.relative(address)}
              labelKey="treasury"
              testId="navigation-treasuryLink"
              Icon={Treasury}
              closeDrawer={closeDrawer}
            />
            <NavigationLink
              href={DAO_ROUTES.proposalTemplates.relative(address)}
              labelKey="proposalTemplates"
              testId="navigation-proposalTemplatesLink"
              Icon={Integrations}
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
          tooltipKey="ariaLabelFAQ"
          labelKey="faq"
          testId="navigationExternal-faq"
          Icon={SupportQuestion}
          closeDrawer={closeDrawer}
        />
        <NavigationExternalLink
          href={URL_DISCORD}
          tooltipKey="ariaLabelDiscord"
          labelKey="discord"
          testId="navigationExternal-discord"
          Icon={Discord}
          closeDrawer={closeDrawer}
        />
        <NavigationExternalLink
          href={URL_DOCS}
          labelKey="documentation"
          tooltipKey="ariaLabelDocumentation"
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
