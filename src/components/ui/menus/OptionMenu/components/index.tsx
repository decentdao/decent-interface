import { Box, Flex, MenuItem, Checkbox, Divider, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export interface IOption {
  optionKey: string;
  count?: number;
  onClick: () => void;
  isSelected?: boolean;
}

export interface IOptionsList {
  options: IOption[];
  closeOnSelect?: boolean;
  showOptionCount?: boolean;
  showOptionSelected?: boolean;
  namespace: string;
  titleKey?: string;
}

export default function OptionsList({
  options,
  showOptionSelected,
  closeOnSelect,
  showOptionCount,
  namespace,
  titleKey,
}: IOptionsList) {
  const { t } = useTranslation(namespace);
  return (
    <>
      {titleKey && (
        <Text
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
          marginBottom="0.5rem"
        >
          {t(titleKey)}
        </Text>
      )}
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
            data-testid={'optionMenu-' + option.optionKey}
          >
            {showOptionSelected ? (
              <Flex flex="1">
                <Checkbox
                  isChecked={option.isSelected}
                  onChange={option.onClick}
                  colorScheme="gold"
                  iconColor="black.900"
                  marginEnd="0.5rem"
                />
                {t(option.optionKey)}
              </Flex>
            ) : (
              t(option.optionKey)
            )}
            {showOptionCount && (
              <Text
                textStyle="text-base-mono-medium"
                color={option.count ? 'grayscale.100' : 'grayscale.500'}
                as="span"
              >
                {option.count}
              </Text>
            )}
          </MenuItem>
          {options[options.length - 1] !== option && (
            <Divider
              marginTop="0.25rem"
              marginBottom="0.25rem"
              color="chocolate.700"
            />
          )}
        </Box>
      ))}
    </>
  );
}
