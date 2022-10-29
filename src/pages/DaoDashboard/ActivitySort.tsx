import { Flex, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { ArrowDownSm } from '@decent-org/fractal-ui';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

export enum SortBy {
  Newest = 'newest',
  Oldest = 'oldest',
}

function SortMenuItem({
  labelKey,
  testId,
  onClick,
}: {
  labelKey: string;
  testId: string;
  onClick: () => void;
}) {
  const { t } = useTranslation('sort');
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

interface IActivitySort {
  sortBy: SortBy;
  setSortBy: Dispatch<SetStateAction<SortBy>>;
}

export function ActivitySort({ sortBy, setSortBy }: IActivitySort) {
  const { t } = useTranslation('sort');
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
          <Text textStyle="text-sm-mono-medium">{t(sortBy)}</Text>
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
