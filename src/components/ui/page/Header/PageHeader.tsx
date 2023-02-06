import { Box, Divider, Flex, Spacer, Button } from '@chakra-ui/react';
import { ReactNode } from 'react';
import useDAOName from '../../../../hooks/DAO/useDAOName';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../../../routes/constants';
import Breadcrumbs, { Crumb } from './Breadcrumbs';
interface IPageHeader {
  breadcrumbs: Crumb[];
  buttonVariant?: 'text' | 'secondary';
  buttonText?: string;
  buttonClick?: () => void;
  buttonTestId?: string;
  children?: ReactNode;
}
/**
 * A component which displays a page title and an optional action button.
 * Intended to be used as the main title for a page.
 */
function PageHeader({
  breadcrumbs,
  buttonVariant,
  buttonText,
  buttonClick,
  buttonTestId,
  children,
}: IPageHeader) {
  const {
    gnosis: {
      safe: { address },
      daoName,
    },
  } = useFractal();
  const { daoRegistryName } = useDAOName({
    address,
  });

  const links = [
    {
      title: daoRegistryName || daoName,
      path: DAO_ROUTES.dao.relative(address),
    },
    ...breadcrumbs,
  ];

  return (
    <Box
      marginTop="3rem"
      marginBottom="2rem"
    >
      <Flex
        w="full"
        align="center"
      >
        <Breadcrumbs links={links} />
        <Spacer />
        {buttonText && (
          <Button
            onClick={buttonClick}
            data-testid={buttonTestId}
            size="base"
            variant={buttonVariant}
          >
            {buttonText}
          </Button>
        )}
        {children}
      </Flex>
      <Divider
        marginTop="1rem"
        borderColor="chocolate.400"
      />
    </Box>
  );
}
export default PageHeader;
