import { Box, Button, Divider, Flex, IconButton, Spacer, Text } from '@chakra-ui/react';
import { Icon } from '@phosphor-icons/react';
import { ReactNode, useEffect, useState } from 'react';
import { DAO_ROUTES } from '../../../../constants/routes';
import { createAccountSubstring } from '../../../../hooks/utils/useDisplayName';
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
  ButtonIcon?: Icon;
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
          terminus: daoName || (daoAddress && createAccountSubstring(daoAddress)) || '',
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
            icon={<ButtonIcon />}
            onClick={buttonClick}
            minWidth="0"
            padding={1}
            border="1px solid"
            borderColor="lilac-0"
            color="lilac-0"
            borderRadius={4}
            data-testid={buttonTestId}
            size="small"
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
        borderColor="neutral-3"
      />
      {title && (
        <Text
          marginTop="1rem"
          textStyle="display-2xl"
          color="white-0"
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
