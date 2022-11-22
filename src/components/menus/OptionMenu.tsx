import { Box, Menu, MenuButton, Text, MenuItem, MenuList, As, Checkbox } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface Option {
  optionKey: string;
  function: () => void;
  isSelected?: boolean;
}

interface IOptionMenu {
  trigger: ReactNode;
  titleKey: string;
  options: Option[];
  namespace: string;
  buttonAs?: As;
  showOptionSelected?: boolean;
  buttonProps?: Record<string, string>;
}

export function OptionMenu({
  trigger,
  titleKey,
  options,
  namespace,
  buttonAs,
  showOptionSelected,
  buttonProps,
}: IOptionMenu) {
  const { t } = useTranslation(namespace);
  return (
    <Menu
      isLazy
      gutter={16}
    >
      <MenuButton
        as={buttonAs}
        h="fit-content"
        {...buttonProps}
      >
        {trigger}
      </MenuButton>
      <MenuList
        rounded="lg"
        shadow="menu-gold"
        mr={['auto', '1rem']}
        bg="grayscale.black"
        border="none"
        padding="1rem"
      >
        <Text
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
          marginBottom="0.5rem"
        >
          {t(titleKey)}
        </Text>
        {options.map(option => (
          <MenuItem
            as={showOptionSelected ? Box : Text}
            key={option.optionKey}
            onClick={option.function}
            textStyle="text-base-mono-medium"
            color="grayscale.100"
            paddingStart="0rem"
            paddingEnd="0rem"
            gap={2}
          >
            {showOptionSelected && <Checkbox isChecked={option.isSelected} />}
            {t(option.optionKey)}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
