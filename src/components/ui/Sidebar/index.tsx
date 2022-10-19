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

function SidebarTooltipWrapper({ label, children }: { label: string; children: JSX.Element }) {
  return (
    <Tooltip
      closeDelay={250}
      hasArrow
      gutter={8}
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
      <IconButton
        aria-label="fractal brand logo"
        icon={<FractalBrand boxSize="2.25rem" />}
        variant="unstyled"
        minWidth="auto"
        m="4"
      />

      <Flex direction="column">
        <SidebarTooltipWrapper label="Home">
          <IconButton
            aria-label="Home link"
            icon={<Home boxSize="1.5rem" />}
            variant="unstyled"
            minWidth="auto"
            m="4"
          />
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label="Proposals">
          <IconButton
            aria-label="Proposals Link"
            icon={<Proposals boxSize="1.5rem" />}
            variant="unstyled"
            minWidth="auto"
            m="4"
          />
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label="Activity Feed">
          <IconButton
            aria-label="Activity Feed Link"
            icon={<Notifications boxSize="1.5rem" />}
            variant="unstyled"
            minWidth="auto"
            m="4"
          />
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label="Treasury">
          <IconButton
            aria-label="Treasury Link"
            icon={<Treasury boxSize="1.5rem" />}
            variant="unstyled"
            minWidth="auto"
            m="4"
          />
        </SidebarTooltipWrapper>
      </Flex>
      <Flex direction="column">
        <SidebarTooltipWrapper label="Support">
          <IconButton
            aria-label="Support External Link"
            icon={<SupportQuestion boxSize="1.5rem" />}
            variant="unstyled"
            minWidth="auto"
            m="2"
          />
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label="Discord">
          <IconButton
            aria-label="Discord Link"
            icon={<Discord boxSize="1.5rem" />}
            variant="unstyled"
            minWidth="auto"
            m="2"
          />
        </SidebarTooltipWrapper>
        <SidebarTooltipWrapper label="Documentation">
          <IconButton
            aria-label="Documentation Link"
            icon={<Documents boxSize="1.5rem" />}
            variant="unstyled"
            minWidth="auto"
            m="2"
          />
        </SidebarTooltipWrapper>
      </Flex>
    </Flex>
  );
}

export default Sidebar;
