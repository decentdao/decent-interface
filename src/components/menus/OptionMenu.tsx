import { Menu, MenuButton, Text, MenuItem, MenuList, Box } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface Option {
  optionKey: string;
  function: Function;
}

export function OptionMenu({
  icon,
  titleKey,
  options,
  namespace,
}: {
  icon: ReactNode;
  titleKey: string;
  options: Option[];
  namespace: string;
}) {
  const { t } = useTranslation(namespace);
  return (
    <Menu isLazy>
      <Menu>
        <MenuButton as={Box}>{icon}</MenuButton>
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
              as={Text}
              key={option.optionKey}
              onClick={() => {
                option.function();
              }}
              textStyle="text-base-mono-medium"
              color="grayscale.100"
              paddingStart="0rem"
              paddingEnd="0rem"
            >
              {t(option.optionKey)}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Menu>
  );
}
