import { Flex, IconButton, Tooltip } from '@chakra-ui/react';
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
import { Link } from 'react-router-dom';
import { BASE_ROUTES, DAO_ROUTES } from '../../../routes/constants';

function SidebarTooltipWrapper({ label, children }: { label: string; children: JSX.Element }) {
  return (
    <Tooltip
      closeDelay={250}
      hasArrow
      gutter={4}
      placement="right"
      label={label}
    >
      {children}
    </Tooltip>
  );
}

function Sidebar() {
  return (
    <Flex
      direction="column"
      justifyContent="space-between"
      flexGrow="1"
    >
      <Link
        to={BASE_ROUTES.landing}
        data-testid="sidebarLogo-homeLink"
      >
        <IconButton
          aria-label="fractal brand  logo"
          icon={<FractalBrand boxSize="2.25rem" />}
          variant="unstyled"
          minWidth="auto"
          m="1rem auto"
        />
      </Link>

      <Flex direction="column">
        <SidebarTooltipWrapper label="Home">
          <Link
            to={DAO_ROUTES.daoHome('0x')}
            data-testid="sidebar-daoHomeLink"
          >
            <IconButton
              aria-label="Home link"
              icon={<Home boxSize="1.5rem" />}
              variant="unstyled"
              minWidth="auto"
              m="1rem auto"
            />
          </Link>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label="Proposals">
          <Link
            to={DAO_ROUTES.proposals('0x')}
            data-testid="sidebar-proposalsLink"
          >
            <IconButton
              aria-label="Proposals Link"
              icon={<Proposals boxSize="1.5rem" />}
              variant="unstyled"
              minWidth="auto"
              m="1rem auto"
            />
          </Link>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label="Activity Feed">
          <Link
            to={DAO_ROUTES.activties('0x')}
            data-testid="sidebar-activityLink"
          >
            <IconButton
              aria-label="Activity Feed Link"
              icon={<Notifications boxSize="1.5rem" />}
              variant="unstyled"
              minWidth="auto"
              m="1rem auto"
            />
          </Link>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label="Treasury">
          <Link
            to={DAO_ROUTES.treasury('0x')}
            data-testid="sidebar-treasuryLink"
          >
            <IconButton
              aria-label="Treasury Link"
              icon={<Treasury boxSize="1.5rem" />}
              variant="unstyled"
              minWidth="auto"
              m="1rem auto"
            />
          </Link>
        </SidebarTooltipWrapper>
      </Flex>
      <Flex direction="column">
        <SidebarTooltipWrapper label="Support">
          <a
            data-testid="sidebarExternal-support"
            rel="noreferrer noopener"
            target="_blank"
            href="https://docs.fractalframework.xyz/welcome-to-fractal/overview/faq"
          >
            <IconButton
              aria-label="Support External Link"
              icon={<SupportQuestion boxSize="1.5rem" />}
              variant="unstyled"
              minWidth="auto"
              m="1rem auto"
            />
          </a>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label="Discord">
          <a
            data-testid="sidebarExternal-discord"
            rel="noreferrer noopener"
            target="_blank"
            href="https://discord.gg/decent-dao"
          >
            <IconButton
              aria-label="Discord Link"
              icon={<Discord boxSize="1.5rem" />}
              variant="unstyled"
              minWidth="auto"
              m="1rem auto"
            />
          </a>
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label="Documentation">
          <a
            data-testid="sidebarExternal-documentation"
            rel="noreferrer noopener"
            target="_blank"
            href="https://docs.fractalframework.xyz/welcome-to-fractal/the-core-framework/developer-overview"
          >
            <IconButton
              aria-label="Documentation Link"
              icon={<Documents boxSize="1.5rem" />}
              variant="unstyled"
              minWidth="auto"
              m="1rem auto"
            />
          </a>
        </SidebarTooltipWrapper>
      </Flex>
    </Flex>
  );
}

export default Sidebar;
