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
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BASE_ROUTES, DAO_ROUTES } from '../../../routes/constants';

function SidebarTooltipWrapper({ label, children }: { label: string; children: JSX.Element }) {
  return (
    <Tooltip
      closeDelay={250}
      gutter={4}
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
      >
        <SidebarTooltipWrapper label={t('home')}>
          <Link
            data-testid="sidebar-daoHomeLink"
            to={DAO_ROUTES.dao.relative('0x')}
          >
            <Home
              boxSize="1.5rem"
              minWidth="auto"
              my="1.5rem"
            />
          </Link>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label={t('proposals')}>
          <Link
            data-testid="sidebar-proposalsLink"
            to={DAO_ROUTES.proposals.relative('0x')}
          >
            <Proposals
              boxSize="1.5rem"
              minWidth="auto"
              my="1.5rem"
            />
          </Link>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label={t('activityFeed')}>
          <Link
            data-testid="sidebar-activityLink"
            to={DAO_ROUTES.activties.relative('0x')}
          >
            <Notifications
              boxSize="1.5rem"
              minWidth="auto"
              my="1.5rem"
            />
          </Link>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label={t('treasury')}>
          <Link
            data-testid="sidebar-treasuryLink"
            to={DAO_ROUTES.treasury.relative('0x')}
          >
            <Treasury
              aria-label="Treasury Link"
              boxSize="1.5rem"
              minWidth="auto"
              my="1.5rem"
            />
          </Link>
        </SidebarTooltipWrapper>
      </Flex>
      <Flex direction="column">
        <SidebarTooltipWrapper label={t('support')}>
          <a
            data-testid="sidebarExternal-support"
            href="https://docs.fractalframework.xyz/welcome-to-fractal/overview/faq"
            rel="noreferrer noopener"
            target="_blank"
            aria-label={t('ariaLabelSupport')}
          >
            <SupportQuestion
              boxSize="1.5rem"
              minWidth="auto"
              my="1.5rem"
            />
          </a>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label="Discord">
          <a
            data-testid="sidebarExternal-discord"
            href="https://discord.gg/decent-dao"
            rel="noreferrer noopener"
            target="_blank"
            aria-label={t('ariaLabelDiscord')}
          >
            <Discord
              boxSize="1.5rem"
              minWidth="auto"
              my="1.5rem"
            />
          </a>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label={t('documentation')}>
          <a
            data-testid="sidebarExternal-documentation"
            href="https://docs.fractalframework.xyz/welcome-to-fractal/the-core-framework/developer-overview"
            rel="noreferrer noopener"
            target="_blank"
            aria-label={t('ariaLabelDocumentation')}
          >
            <Documents
              boxSize="1.5rem"
              minWidth="auto"
              my="1.5rem"
            />
          </a>
        </SidebarTooltipWrapper>
      </Flex>
    </Flex>
  );
}

export default Sidebar;
