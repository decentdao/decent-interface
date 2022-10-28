import { Flex, Tooltip } from '@chakra-ui/react';
import {
  Discord,
  Documents,
  FractalBrand,
  Home,
  Notifications,
  Proposals,
  SupportQuestion,
  Treasury,
} from '@decent-org/fractal-ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useFractal } from '../../../providers/fractal/hooks/useFractal';
import { BASE_ROUTES, DAO_ROUTES } from '../../../routes/constants';
import { URL_DISCORD, URL_DOCS, URL_FAQ } from '../../constants';

function SidebarTooltipWrapper({ label, children }: { label: string; children: JSX.Element }) {
  return (
    <Tooltip
      closeDelay={250}
      gutter={10}
      hasArrow
      label={label}
      placement="right"
    >
      {children}
    </Tooltip>
  );
}

function Sidebar() {
  const { t } = useTranslation('sidebar');
  const {
    gnosis: {
      safe: { address },
    },
  } = useFractal();
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
          boxSize="2.25rem"
          m="1rem auto"
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
              >
                <Home
                  boxSize="1.5rem"
                  minWidth="auto"
                />
              </Link>
            </SidebarTooltipWrapper>
            <SidebarTooltipWrapper label={t('proposals')}>
              <Link
                data-testid="sidebar-proposalsLink"
                to={DAO_ROUTES.proposals.relative(address)}
              >
                <Proposals
                  boxSize="1.5rem"
                  minWidth="auto"
                />
              </Link>
            </SidebarTooltipWrapper>
            <SidebarTooltipWrapper label={t('activityFeed')}>
              <Link
                data-testid="sidebar-activityLink"
                to={DAO_ROUTES.activties.relative(address)}
              >
                <Notifications
                  boxSize="1.5rem"
                  minWidth="auto"
                />
              </Link>
            </SidebarTooltipWrapper>
            <SidebarTooltipWrapper label={t('treasury')}>
              <Link
                data-testid="sidebar-treasuryLink"
                to={DAO_ROUTES.treasury.relative(address)}
              >
                <Treasury
                  aria-label="Treasury Link"
                  boxSize="1.5rem"
                  minWidth="auto"
                />
              </Link>
            </SidebarTooltipWrapper>
          </Fragment>
        )}
      </Flex>
      <Flex
        direction="column"
        gap="2rem"
        mb="8"
      >
        <SidebarTooltipWrapper label={t('support')}>
          <a
            data-testid="sidebarExternal-support"
            href={URL_FAQ}
            rel="noreferrer noopener"
            target="_blank"
            aria-label={t('ariaLabelSupport')}
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
      </Flex>
    </Flex>
  );
}

export default Sidebar;
