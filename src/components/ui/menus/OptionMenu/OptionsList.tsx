import { Box, Flex, MenuItem, Checkbox, Divider, Text } from '@chakra-ui/react';
import { ChangeEvent, MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { IOption, IOptionsList } from './types';

export function OptionsList({
  options,
  showOptionSelected,
  closeOnSelect,
  showOptionCount,
  namespace,
  titleKey,
}: IOptionsList) {
  const { t } = useTranslation(namespace);
  const createHandleItemClick =
    (option: IOption) => (e: MouseEvent<HTMLButtonElement> | ChangeEvent) => {
      e.stopPropagation();
      option.onClick();
    };
  return (
    <>
      {titleKey && (
        <Text
          marginBottom="0.5rem"
          textStyle="helper-text-small"
          color="neutral-7"
        >
          {t(titleKey)}
        </Text>
      )}
      {options.map(option => {
        const clickListener = createHandleItemClick(option);
        return (
          <Box key={option.optionKey}>
            <MenuItem
              as={showOptionSelected ? Box : Text}
              onClick={clickListener}
              cursor="pointer"
              _hover={{ bg: 'neutral-3', textDecoration: 'none' }}
              p="0.5rem 1rem"
              gap={2}
              closeOnSelect={closeOnSelect}
              data-testid={'optionMenu-' + option.optionKey}
            >
              {showOptionSelected ? (
                <Flex flex="1">
                  <Checkbox
                    isChecked={option.isSelected}
                    onChange={clickListener}
                    marginEnd="0.5rem"
                  />
                  {t(option.optionKey)}
                </Flex>
              ) : (
                t(option.optionKey)
              )}
              {showOptionCount && <Text as="span">{option.count}</Text>}
            </MenuItem>
            {options[options.length - 1] !== option && (
              <Divider
                marginTop="0.25rem"
                marginBottom="0.25rem"
                color="neutral-3"
              />
            )}
          </Box>
        );
      })}
    </>
  );
}
