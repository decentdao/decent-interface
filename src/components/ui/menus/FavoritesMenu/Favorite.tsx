import { Box, Button, MenuItem } from '@chakra-ui/react';
import { Star } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { DAO_ROUTES } from '../../../../constants/routes';
import useDAOName from '../../../../hooks/DAO/useDAOName';
import { useFractal } from '../../../../providers/App/AppProvider';

interface IFavorite {
  network: string;
  address: string;
}
export function Favorite({ network, address }: IFavorite) {
  const { daoRegistryName } = useDAOName({ address });
  const { action } = useFractal();
  const navigate = useNavigate();

  const onClickNav = () => {
    action.resetDAO();
    navigate(DAO_ROUTES.dao.relative(network, address));
  };

  return (
    <Box>
      <MenuItem
        as={Button}
        variant="tertiary"
        w="full"
        h="3rem"
        onClick={onClickNav}
        noOfLines={1}
        data-testid={'favorites-' + daoRegistryName}
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={2}
      >
        {daoRegistryName && <Star
          size="1.5rem"
          weight="fill"
        />}
        {daoRegistryName}
      </MenuItem>
    </Box>
  );
}
