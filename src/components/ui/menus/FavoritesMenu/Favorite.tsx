import { MenuItem, Text } from '@chakra-ui/react';
import { StarGoldSolid } from '@decent-org/fractal-ui';
import { useRouter } from 'next/router';
import { DAO_ROUTES } from '../../../../constants/routes';
import useDAOName from '../../../../hooks/DAO/useDAOName';

interface IFavorite {
  address: string;
}
export function Favorite({ address }: IFavorite) {
  const { daoRegistryName } = useDAOName({ address });

  const { push } = useRouter();

  return (
    <MenuItem
      display="flex"
      alignItems="center"
      gap="2"
      width="full"
      px="0px"
      onClick={() => push(DAO_ROUTES.dao.relative(address))}
      data-testid={'favorites-' + daoRegistryName}
    >
      <StarGoldSolid />
      <Text
        maxWidth="9rem"
        noOfLines={1}
        color="grayscale.100"
        textStyle="text-base-sans-medium"
        _hover={{
          color: 'gold.500',
        }}
      >
        {daoRegistryName}
      </Text>
    </MenuItem>
  );
}
