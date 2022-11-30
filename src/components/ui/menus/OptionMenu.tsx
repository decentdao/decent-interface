import {
  Box,
  Flex,
  Menu,
  MenuButton,
  Text,
  MenuItem,
  MenuList,
  As,
  Checkbox,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface Option {
  optionKey: string;
  count?: number;
  onClick: () => void;
  isSelected?: boolean;
}

interface IOptionMenu {
  trigger: ReactNode;
  titleKey: string;
  options: Option[];
  namespace: string;
  buttonAs?: As;
  showOptionSelected?: boolean;
  buttonProps?: Record<string, string | boolean | number>;
  children?: ReactNode;
  closeOnSelect?: boolean;
  showOptionCount?: boolean;
}

export function OptionMenu({
  trigger,
  titleKey,
  options,
  namespace,
  buttonAs,
  showOptionSelected,
  showOptionCount,
  buttonProps,
  children,
  closeOnSelect = true,
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
        {children}
        {options.map(option => (
          <MenuItem
            as={showOptionSelected ? Box : Text}
            key={option.optionKey}
            onClick={option.onClick}
            textStyle="text-base-mono-medium"
            color="grayscale.100"
            paddingStart="0rem"
            paddingEnd="0rem"
            gap={2}
            closeOnSelect={closeOnSelect}
          >
            <Flex>
              {showOptionSelected && (
                <Checkbox
                  isChecked={option.isSelected}
                  onChange={option.onClick}
                  colorScheme="gold"
                  iconColor="black.900"
                  marginEnd="0.5rem"
                />
              )}
              {t(option.optionKey)}
            </Flex>
            {showOptionCount && (
              <Text
                textStyle="text-base-mono-medium"
                color={option.count ? 'grayscale.100' : 'grayscale.500'}
              >
                {option.count}
              </Text>
            )}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
