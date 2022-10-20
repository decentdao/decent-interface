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
      >
        <FractalBrand
          aria-label="Fractal brand logo"
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
            to={DAO_ROUTES.daoHome('0x')}
          >
            <Home
              aria-label="Home link"
              boxSize="1.5rem"
              minWidth="auto"
              my="1.5rem"
            />
          </Link>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label={t('proposals')}>
          <Link
            data-testid="sidebar-proposalsLink"
            to={DAO_ROUTES.proposals('0x')}
          >
            <Proposals
              aria-label="Proposals Link"
              boxSize="1.5rem"
              minWidth="auto"
              my="1.5rem"
            />
          </Link>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label={t('activityFeed')}>
          <Link
            data-testid="sidebar-activityLink"
            to={DAO_ROUTES.activties('0x')}
          >
            <Notifications
              aria-label="Activity Feed Link"
              boxSize="1.5rem"
              minWidth="auto"
              my="1.5rem"
            />
          </Link>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label={t('treasury')}>
          <Link
            data-testid="sidebar-treasuryLink"
            to={DAO_ROUTES.treasury('0x')}
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
          >
            <SupportQuestion
              aria-label="Support External Link"
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
          >
            <Discord
              aria-label="Discord Link"
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
          >
            <Documents
              aria-label="Documentation Link"
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
