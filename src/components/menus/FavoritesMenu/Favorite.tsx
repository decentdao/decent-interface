import { Flex, Text } from '@chakra-ui/react';
import { StarGoldSolid } from '@decent-org/fractal-ui';
import { Link } from 'react-router-dom';
import useDisplayName from '../../../hooks/useDisplayName';
import { DAO_ROUTES } from '../../../routes/constants';

interface IFavorite {
  address: string;
}
export function Favorite({ address }: IFavorite) {
  const displayName = useDisplayName(address);
  return (
    <Link to={DAO_ROUTES.dao.relative(address)}>
      <Flex
        alignItems="center"
        gap="2"
        width="full"
        my="0.5rem"
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
          {displayName}
        </Text>
      </Flex>
    </Link>
  );
}
