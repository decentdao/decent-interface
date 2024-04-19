import { Divider, Flex, Icon, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { CaretDown } from '@phosphor-icons/react';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { SortBy } from '../../../types';

function SortMenuItem({
  labelKey,
  testId,
  onClick,
}: {
  labelKey: string;
  testId: string;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <MenuItem
      py="0.5rem"
      color="grayscale.100"
      sx={{
        '&:hover': { bg: 'neutral-3' },
      }}
      data-testid={testId}
      onClick={onClick}
    >
      <Text textStyle="text-sm-mono-semibold">{t(labelKey)}</Text>
    </MenuItem>
  );
}

interface ISort {
  sortBy: SortBy;
  setSortBy: Dispatch<SetStateAction<SortBy>>;
  buttonProps?: {
    disabled?: boolean;
  };
}

export function Sort({ sortBy, setSortBy, buttonProps }: ISort) {
  const { t } = useTranslation();
  return (
    <Menu direction="ltr">
      <MenuButton
        data-testid="sort-openMenu"
        color="lilac-0"
        p="0.25rem 0.5rem"
        sx={{
          '&:hover': {
            color: 'lilac--1',
            bg: 'white-alpha-04',
            borderRadius: '0.25rem',
          },
        }}
        {...buttonProps}
      >
        <Flex alignItems="center">
          <Text>{t(sortBy)}</Text>
          <Icon
            ml="0.25rem"
            p={1.25}
            as={CaretDown}
          />
        </Flex>
      </MenuButton>

      <MenuList
        borderWidth="1px"
        borderColor="neutral-3"
        borderRadius="0.5rem"
        bg="neutral-2" // neutral-2-84 ??
        p="0.5rem 1rem"
        minWidth="min-content"
        zIndex={5}
      >
        <SortMenuItem
          labelKey={SortBy.Newest}
          testId="sort-newest"
          onClick={() => setSortBy(SortBy.Newest)}
        />
        {/* TODO Divider look doesn't quite match */}
        <Divider color="neutral-3" />
        <SortMenuItem
          labelKey={SortBy.Oldest}
          testId="sort-oldest"
          onClick={() => setSortBy(SortBy.Oldest)}
        />
      </MenuList>
    </Menu>
  );
}
