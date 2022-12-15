import { MenuItem, Text } from '@chakra-ui/react';
import { StarGoldSolid } from '@decent-org/fractal-ui';
import { useNavigate } from 'react-router-dom';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../../../routes/constants';

interface IFavorite {
  address: string;
}
export function Favorite({ address }: IFavorite) {
  const {
    gnosis: { daoName },
  } = useFractal();

  const navigate = useNavigate();

  return (
    <MenuItem
      display="flex"
      alignItems="center"
      gap="2"
      width="full"
      px="0px"
      onClick={() => navigate(DAO_ROUTES.dao.relative(address))}
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
        {daoName}
      </Text>
    </MenuItem>
  );
}
