import { Flex, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { ArrowDownSm } from '@decent-org/fractal-ui';
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
        '&:hover': {
          color: 'gold.500',
        },
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
        color="gold.500"
        sx={{
          '&:hover': {
            color: 'gold.500-hover',
          },
        }}
        {...buttonProps}
      >
        <Flex
          alignItems="center"
          color="gold.500"
        >
          <Text textStyle="text-sm-mono-medium">{t(sortBy)}</Text>
          <ArrowDownSm boxSize="1.5rem" />
        </Flex>
      </MenuButton>
      <MenuList
        border="none"
        rounded="lg"
        shadow="menu-gold"
        bg="grayscale.black"
        p="0.5rem 1rem"
        minWidth="min-content"
      >
        <SortMenuItem
          labelKey={SortBy.Newest}
          testId="sort-newest"
          onClick={() => setSortBy(SortBy.Newest)}
        />
        <SortMenuItem
          labelKey={SortBy.Oldest}
          testId="sort-oldest"
          onClick={() => setSortBy(SortBy.Oldest)}
        />
      </MenuList>
    </Menu>
  );
}
