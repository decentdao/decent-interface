import { Center, ComponentWithAs, Divider, Flex, IconProps, Tooltip } from '@chakra-ui/react';
import {
  Discord,
  Documents,
  FractalBrand,
  Home,
  Proposals,
  SupportQuestion,
  Treasury,
  Tree,
} from '@decent-org/fractal-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useMatch } from 'react-router-dom';
import { URL_DISCORD, URL_DOCS, URL_FAQ } from '../../../../constants/url';
import { LanguageSwitcher } from '../../../../i18n/LanguageSwitcher';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { BASE_ROUTES, DAO_ROUTES } from '../../../../routes/constants';

function SidebarTooltipWrapper({ label, children }: { label: string; children: JSX.Element }) {
  return (
    <Center>
      <Tooltip
        closeDelay={250}
        gutter={10}
        hasArrow
        label={label}
        placement="right"
      >
        {children}
      </Tooltip>
    </Center>
  );
}

function SidebarNavLink({
  to,
  labelKey,
  testId,
  Icon,
  routeKey,
}: {
  to: string;
  labelKey: string;
  testId: string;
  routeKey: string;
  Icon: ComponentWithAs<'svg', IconProps>;
}) {
  const { t } = useTranslation('sidebar');
  const patternString =
    routeKey === 'dao' ? 'daos/:address' : `daos/:address/${DAO_ROUTES[routeKey].path}/*`;
  const match = useMatch(patternString);

  const activeColors = useCallback(() => {
    let isActive = !!match;
    return {
      color: isActive ? 'gold.500' : 'inherit',
      _hover: {
        color: isActive ? 'gold.500-hover' : 'inherit',
      },
    };
  }, [match]);

  return (
    <SidebarTooltipWrapper label={t(labelKey)}>
      <Link
        data-testid={testId}
        to={to}
        aria-label={t(labelKey)}
      >
        <Icon
          boxSize="1.5rem"
          minWidth="auto"
          {...activeColors()}
        />
      </Link>
    </SidebarTooltipWrapper>
  );
}

function Sidebar() {
  const { t } = useTranslation('sidebar');
  const {
    gnosis: {
      safe: { address },
      safeService,
      isGnosisLoading,
    },
  } = useFractal();

  const showSideBar = address && safeService && !isGnosisLoading;

  return (
    <Flex
      alignItems="center"
      direction="column"
      flexGrow="1"
      justifyContent="space-between"
    >
      <Link
        data-testid="sidebarLogo-homeLink"
        to={BASE_ROUTES.landing}
        aria-label={t('ariaLabelFractalBrand')}
      >
        <FractalBrand
          aria-hidden
          boxSize="4.4rem"
          minWidth="auto"
        />
      </Link>

      {showSideBar && (
        <Flex
          alignItems="center"
          direction="column"
          gap="2rem"
        >
          <SidebarNavLink
            to={DAO_ROUTES.dao.relative(address)}
            labelKey="home"
            testId="sidebar-daoHomeLink"
            routeKey="dao"
            Icon={Home}
          />
          <SidebarNavLink
            to={DAO_ROUTES.nodes.relative(address)}
            labelKey="nodes"
            testId="sidebar-hierarchy"
            routeKey="nodes"
            Icon={Tree}
          />
          <SidebarNavLink
            to={DAO_ROUTES.proposals.relative(address)}
            labelKey="proposals"
            testId="sidebar-proposalsLink"
            routeKey="proposals"
            Icon={Proposals}
          />
          <SidebarNavLink
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
        <SidebarTooltipWrapper label={t('faq')}>
          <a
            data-testid="sidebarExternal-faq"
            href={URL_FAQ}
            rel="noreferrer noopener"
            target="_blank"
            aria-label={t('ariaLabelFAQ')}
          >
            <SupportQuestion
              boxSize="1.5rem"
              minWidth="auto"
            />
          </a>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label="Discord">
          <a
            data-testid="sidebarExternal-discord"
            href={URL_DISCORD}
            rel="noreferrer noopener"
            target="_blank"
            aria-label={t('ariaLabelDiscord')}
          >
            <Discord
              boxSize="1.5rem"
              minWidth="auto"
            />
          </a>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label={t('documentation')}>
          <a
            data-testid="sidebarExternal-documentation"
            href={URL_DOCS}
            rel="noreferrer noopener"
            target="_blank"
            aria-label={t('ariaLabelDocumentation')}
          >
            <Documents
              boxSize="1.5rem"
              minWidth="auto"
            />
          </a>
        </SidebarTooltipWrapper>
        <Divider color="chocolate.700" />
        <LanguageSwitcher data-testid="sidebar-language" />
      </Flex>
    </Flex>
  );
}

export default Sidebar;
