import { MenuItem, Text } from '@chakra-ui/react';
import { StarGoldSolid } from '@decent-org/fractal-ui';
import { useNavigate } from 'react-router-dom';
import useDAOName from '../../../../hooks/DAO/useDAOName';
import { DAO_ROUTES } from '../../../../routes/constants';

interface IFavorite {
  address: string;
}
export function Favorite({ address }: IFavorite) {
  const { daoRegistryName } = useDAOName({ address });

  const navigate = useNavigate();

  return (
    <MenuItem
      display="flex"
      alignItems="center"
      gap="2"
      width="full"
      px="0px"
      onClick={() => navigate(DAO_ROUTES.dao.relative(address))}
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
