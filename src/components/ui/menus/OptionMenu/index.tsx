import { Menu, MenuButton, MenuList, As, MenuProps, Tooltip, Divider } from '@chakra-ui/react';
import { MouseEvent, ReactNode, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import OptionsList, { IOption, IOptionsList } from './components';

export interface IOptionGroup {
  titleKey?: string;
  options: IOption[];
}

interface IOptionMenu extends Omit<MenuProps, 'children'>, IOptionsList {
  trigger: ReactNode;
  tooltipKey?: string;
  options: IOption[];
  optionGroups?: IOptionGroup[];
  buttonAs?: As;
  buttonProps?: Record<string, string | boolean | number>;
  children?: ReactNode;
}

export function OptionMenu({
  trigger,
  titleKey,
  tooltipKey,
  options,
  optionGroups,
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
        {optionGroups && optionGroups?.length > 0 ? (
          optionGroups.map((optionGroup, i) => (
            <Fragment key={optionGroup.titleKey}>
              <OptionsList
                options={optionGroup.options}
                titleKey={optionGroup.titleKey}
                showOptionSelected={showOptionSelected}
                closeOnSelect={closeOnSelect}
                showOptionCount={showOptionCount}
                namespace={namespace}
              />
              {i !== optionGroups.length - 1 && (
                <Divider
                  marginTop="1rem"
                  marginBottom="1rem"
                  color="chocolate.700"
                />
              )}
            </Fragment>
          ))
        ) : (
          <OptionsList
            options={options}
            showOptionSelected={showOptionSelected}
            closeOnSelect={closeOnSelect}
            showOptionCount={showOptionCount}
            namespace={namespace}
            titleKey={titleKey}
          />
        )}
      </MenuList>
    </Menu>
  );
}
