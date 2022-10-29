import { Flex, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { ArrowDownSm } from '@decent-org/fractal-ui';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

export enum SortBy {
  Newest = 'Newest',
  Oldest = 'Oldest',
}

function SortMenuItem({ labelKey }: { labelKey: string }) {
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
    >
      <Text textStyle="text-sm-mono-semibold">{t(labelKey)}</Text>
    </MenuItem>
  );
}

interface IActivitySort {
  sortBy: SortBy;
  setSortBy: Dispatch<SetStateAction<SortBy>>;
}

export function ActivitySort({ sortBy, setSortBy }: IActivitySort) {
  return (
    <Menu direction="ltr">
      <MenuButton
        color="gold.500"
        sx={{
          '&:hover': {
            color: 'gold.500-hover',
          },
        }}
      >
        <Flex
          alignItems="center"
          color="gold.500"
        >
          <Text textStyle="text-sm-mono-medium">Newest</Text>
          <ArrowDownSm boxSize="1.5rem" />
        </Flex>
      </MenuButton>
      <MenuList
        border="none"
        rounded="lg"
        shadow={'0px 0px 48px rgba(250, 189, 46, 0.48)'}
        bg="grayscale.black"
        p="0.5rem 1rem"
        minWidth="min-content"
      >
        <SortMenuItem labelKey="sort:newest" />
        <SortMenuItem labelKey="sort:oldest" />
      </MenuList>
    </Menu>
  );
}
