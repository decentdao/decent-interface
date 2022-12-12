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
  Divider,
  MenuProps,
} from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface Option {
  optionKey: string;
  count?: number;
  onClick: () => void;
  isSelected?: boolean;
}

interface IOptionMenu extends Omit<MenuProps, 'children'> {
  trigger: ReactNode;
  titleKey?: string;
  options: Option[];
  namespace: string;
  buttonAs?: As;
  showOptionSelected?: boolean;
  buttonProps?: Record<string, string | boolean | number>;
  children?: ReactNode;
  closeOnSelect?: boolean;
  showOptionCount?: boolean;
  showDividers?: boolean;
}

export function OptionMenu({
  trigger,
  titleKey,
  options,
  namespace,
  buttonAs,
  showOptionSelected,
  showOptionCount,
  showDividers,
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
        {titleKey && (
          <Text
            textStyle="text-sm-sans-regular"
            color="chocolate.200"
            marginBottom="0.5rem"
          >
            {t(titleKey)}
          </Text>
        )}
        {children}
        {options.map(option => (
          <Box key={option.optionKey}>
            <MenuItem
              as={showOptionSelected ? Box : Text}
              onClick={option.onClick}
              cursor="pointer"
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
            {showDividers && options[options.length - 1] !== option && (
              <Divider
                marginTop="0.25rem"
                marginBottom="0.25rem"
                color="chocolate.700"
              />
            )}
          </Box>
        ))}
      </MenuList>
    </Menu>
  );
}
