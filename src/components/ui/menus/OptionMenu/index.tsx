import { Menu, MenuButton, MenuList, As, MenuProps, Tooltip } from '@chakra-ui/react';
import { MouseEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import OptionsList, { IOption, IOptionsList } from './components';

interface IOptionMenu extends Omit<MenuProps, 'children'>, IOptionsList {
  trigger: ReactNode;
  tooltipKey?: string;
  options: IOption[];
  buttonAs?: As;
  buttonProps?: Record<string, string | boolean | number>;
  children?: ReactNode;
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
  ...rest
}: IOptionMenu) {
  const { t } = useTranslation(namespace);
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
          h="fit-content"
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
          }}
          {...buttonProps}
        >
          {trigger}
        </MenuButton>
      </Tooltip>
      <MenuList
        rounded="lg"
        shadow="menu-gold"
        mr={['auto', '1rem']}
        bg="grayscale.black"
        border="none"
        padding="1rem"
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
    </Menu>
  );
}
