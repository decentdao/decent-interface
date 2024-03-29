import {
  Box,
  Button,
  ComponentWithAs,
  Divider,
  Flex,
  IconButton,
  IconProps,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { ReactNode, useEffect, useState } from 'react';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import AddressCopier from '../../links/AddressCopier';
import Breadcrumbs, { Crumb } from './Breadcrumbs';
interface IPageHeader {
  title?: string;
  address?: string;
  breadcrumbs: Crumb[];
  hasDAOLink?: boolean;
  buttonVariant?: 'text' | 'secondary';
  ButtonIcon?: ComponentWithAs<'svg', IconProps>;
  buttonText?: string;
  buttonClick?: () => void;
  buttonTestId?: string;
  isButtonDisabled?: boolean;
  children?: ReactNode;
}
/**
 * A component which displays a page title and an optional action button.
 * Intended to be used as the main title for a page.
 */
function PageHeader({
  title,
  address,
  breadcrumbs,
  hasDAOLink = true,
  buttonVariant,
  ButtonIcon,
  buttonText,
  buttonClick,
  buttonTestId,
  isButtonDisabled,
  children,
}: IPageHeader) {
  const {
    node: { daoAddress, daoName },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();

  const [links, setLinks] = useState([...breadcrumbs]);

  useEffect(() => {
    if (hasDAOLink && daoAddress) {
      setLinks([
        {
          terminus: daoName || '',
          path: DAO_ROUTES.dao.relative(addressPrefix, daoAddress),
        },
        ...breadcrumbs,
      ]);
    }
  }, [hasDAOLink, daoName, daoAddress, breadcrumbs, addressPrefix]);

  return (
    <Box
      marginTop="3rem"
      marginBottom="2rem"
    >
      <Flex
        alignItems="center"
        gap={{ base: 1, sm: 4 }}
        w="full"
      >
        <Breadcrumbs links={links} />
        <Spacer />
        {buttonText && (
          <Button
            onClick={buttonClick}
            data-testid={buttonTestId}
            variant={buttonVariant}
            isDisabled={isButtonDisabled}
          >
            {buttonText}
          </Button>
        )}
        {ButtonIcon && (
          <IconButton
            aria-label="navigate"
            icon={<ButtonIcon boxSize="1.5rem" />}
            onClick={buttonClick}
            minWidth="0"
            px="1rem"
            data-testid={buttonTestId}
            size="base"
            variant={buttonVariant}
            isDisabled={isButtonDisabled}
          >
            {buttonText}
          </IconButton>
        )}
        {children}
      </Flex>
      <Divider
        marginTop="1rem"
        borderColor="chocolate.400"
      />
      {title && (
        <Text
          marginTop="2rem"
          textStyle="text-2xl-mono-regular"
          color="grayscale.100"
        >
          {title}
        </Text>
      )}
      {address && (
        <AddressCopier
          marginTop="0.5rem"
          address={address}
        />
      )}
    </Box>
  );
}
export default PageHeader;
