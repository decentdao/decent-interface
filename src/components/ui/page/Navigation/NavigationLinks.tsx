import { Divider, Flex } from '@chakra-ui/react';
import {
  Home,
  Tree,
  Proposals,
  Treasury,
  SupportQuestion,
  Discord,
  Documents,
} from '@decent-org/fractal-ui';
import { URL_FAQ, URL_DISCORD, URL_DOCS } from '../../../../constants/url';
import { LanguageSwitcher } from '../../../../i18n/LanguageSwitcher';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../../../routes/constants';
import { NavigationLink } from './NavigationLink';

export function NavigationLinks() {
  const {
    gnosis: {
      safe: { address },
      safeService,
      isGnosisLoading,
    },
  } = useFractal();

  const showSideBar = address && safeService && !isGnosisLoading;
  return (
    <>
      {showSideBar && (
        <Flex
          alignItems="center"
          direction="column"
          gap="2rem"
        >
          <NavigationLink
            to={DAO_ROUTES.dao.relative(address)}
            labelKey="home"
            testId="sidebar-daoHomeLink"
            routeKey="dao"
            Icon={Home}
          />
          <NavigationLink
            to={DAO_ROUTES.nodes.relative(address)}
            labelKey="nodes"
            testId="sidebar-hierarchy"
            routeKey="nodes"
            Icon={Tree}
          />
          <NavigationLink
            to={DAO_ROUTES.proposals.relative(address)}
            labelKey="proposals"
            testId="sidebar-proposalsLink"
            routeKey="proposals"
            Icon={Proposals}
          />
          <NavigationLink
            to={DAO_ROUTES.treasury.relative(address)}
            labelKey="treasury"
            testId="sidebar-treasuryLink"
            routeKey="treasury"
            Icon={Treasury}
          />
        </Flex>
      )}
      <Flex
        alignSelf="normal"
        direction="column"
        gap="2rem"
        mb="8"
      >
        <Divider color="chocolate.700" />
        <NavigationLink
          to={URL_FAQ}
          labelKey="ariaLabelFAQ"
          testId="sidebarExternal-faq"
          Icon={SupportQuestion}
          rel="noreferrer noopener"
        />
        <NavigationLink
          to={URL_DISCORD}
          labelKey="ariaLabelDiscord"
          testId="sidebarExternal-discord"
          Icon={Discord}
          rel="noreferrer noopener"
        />
        <NavigationLink
          to={URL_DOCS}
          labelKey="ariaLabelDocumentation"
          testId="sidebarExternal-documentation"
          Icon={Documents}
          rel="noreferrer noopener"
        />

        <Divider color="chocolate.700" />
        <LanguageSwitcher data-testid="sidebar-language" />
      </Flex>
    </>
  );
}
