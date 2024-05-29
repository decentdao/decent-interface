import { Menu, MenuButton, MenuList, As, MenuProps, Tooltip, Portal } from '@chakra-ui/react';
import { MouseEvent, ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { NEUTRAL_2_82_TRANSPARENT } from '../../../../constants/common';
import { OptionsList } from './OptionsList';
import { IOption, IOptionsList } from './types';

interface OptionMenuProps extends Omit<MenuProps, 'children'>, IOptionsList {
  trigger: ReactNode;
  tooltipKey?: string;
  options: IOption[];
  buttonAs?: As;
  buttonProps?: Record<string, string | boolean | number | Record<string, any>>;
  children?: ReactNode;
  menuListMr?: string;
  containerRef?: RefObject<HTMLDivElement | null>;
}

export function OptionMenu({
  trigger,
  titleKey,
  tooltipKey,
  options,
  namespace,
  buttonAs,
  showOptionSelected,
  showOptionCount,
  buttonProps,
  children,
  closeOnSelect = true,
  menuListMr,
  containerRef,
  ...rest
}: OptionMenuProps) {
  const { t } = useTranslation(namespace);
  const menuList = (
    <MenuList
      borderWidth="1px"
      borderColor="neutral-3"
      borderRadius="0.75rem"
      bg={NEUTRAL_2_82_TRANSPARENT}
      backdropFilter="blur(12px)"
      mr={menuListMr || ['auto', '1rem']}
      pb="0.25rem"
      zIndex={1000}
    >
      {children}
      <OptionsList
        options={options}
        showOptionSelected={showOptionSelected}
        closeOnSelect={closeOnSelect}
        showOptionCount={showOptionCount}
        namespace={namespace}
        titleKey={titleKey}
      />
    </MenuList>
  );
  return (
    <Menu
      isLazy
      {...rest}
    >
      <Tooltip
        closeDelay={0}
        hasArrow
        label={tooltipKey ? t(tooltipKey) : undefined}
        placement="right"
      >
        <MenuButton
          as={buttonAs}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
          }}
          {...buttonProps}
        >
          {trigger}
        </MenuButton>
      </Tooltip>

      {containerRef !== undefined ? (
        <Portal containerRef={containerRef}>{menuList}</Portal>
      ) : (
        menuList
      )}
    </Menu>
  );
}
