import { Box, Button, MenuItem, Text } from '@chakra-ui/react';
import { Star } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAddress } from 'viem';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useGetDAOName } from '../../../../hooks/DAO/useGetDAOName';

export interface SafeMenuItemProps {
  network: string;
  address: string;
  showAddress?: boolean;
  onClick?: () => void;
}

export function SafeMenuItem({ network, address }: SafeMenuItemProps) {
  const { daoName } = useGetDAOName({ address: getAddress(address) });

  const navigate = useNavigate();

  const { t } = useTranslation('dashboard');

  const onClickNav = () => {
    navigate(DAO_ROUTES.dao.relative(network, address));
  };

  return (
    <Box px="0.25rem">
      <MenuItem
        as={Button}
        variant="tertiary"
        w="full"
        h="3rem"
        onClick={onClickNav}
        noOfLines={1}
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        gap={2}
      >
        <Star
          size="1.5rem"
          weight="fill"
        />

        <Text color={daoName ? 'white-0' : 'neutral-6'}>{daoName ?? t('loadingFavorite')}</Text>
      </MenuItem>
    </Box>
  );
}
