import { Center, Divider, Flex, Tooltip } from '@chakra-ui/react';
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
import { Fragment, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { URL_DISCORD, URL_DOCS, URL_FAQ } from '../../../constants/url';
import { LanguageSwitcher } from '../../../i18n/LanguageSwitcher';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { BASE_ROUTES, DAO_ROUTES } from '../../../routes/constants';

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

function Sidebar() {
  const { t } = useTranslation('sidebar');
  const {
    gnosis: {
      safe: { address },
    },
  } = useFractal();

  const { pathname } = useLocation();

  const activeColors = useCallback(
    (key: string) => {
      return {
        color: pathname === DAO_ROUTES[key].relative(address!) ? 'gold.500' : 'inherit',
        _hover: {
          color: pathname === DAO_ROUTES[key].relative(address!) ? 'gold.500-hover' : 'inherit',
        },
      };
    },
    [pathname, address]
  );
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

      <Flex
        alignItems="center"
        direction="column"
        gap="2rem"
      >
        {address && (
          <Fragment>
            <SidebarTooltipWrapper label={t('home')}>
              <Link
                data-testid="sidebar-daoHomeLink"
                to={DAO_ROUTES.dao.relative(address)}
                aria-label="DAO Dashboard Link"
              >
                <Home
                  boxSize="1.5rem"
                  minWidth="auto"
                  {...activeColors('dao')}
                />
              </Link>
            </SidebarTooltipWrapper>
            <SidebarTooltipWrapper label={t('nodes')}>
              <Link
                data-testid="sidebar-nodes"
                to={DAO_ROUTES.nodes.relative(address)}
                aria-label="Nodes Link"
              >
                <Tree
                  boxSize="1.5rem"
                  minWidth="auto"
                  {...activeColors('nodes')}
                />
              </Link>
            </SidebarTooltipWrapper>
            <SidebarTooltipWrapper label={t('proposals')}>
              <Link
                data-testid="sidebar-proposalsLink"
                to={DAO_ROUTES.proposals.relative(address)}
                aria-label="Proposals Link"
              >
                <Proposals
                  boxSize="1.5rem"
                  minWidth="auto"
                  {...activeColors('proposals')}
                />
              </Link>
            </SidebarTooltipWrapper>
            <SidebarTooltipWrapper label={t('treasury')}>
              <Link
                data-testid="sidebar-treasuryLink"
                to={DAO_ROUTES.treasury.relative(address)}
                aria-label="Treasury Link"
              >
                <Treasury
                  boxSize="1.5rem"
                  minWidth="auto"
                  {...activeColors('treasury')}
                />
              </Link>
            </SidebarTooltipWrapper>
          </Fragment>
        )}
      </Flex>
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
        <LanguageSwitcher />
      </Flex>
    </Flex>
  );
}

export default Sidebar;
