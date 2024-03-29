import { Link, HStack, Image, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';

/**
 * Displays a link to the current DAO's parent, if it has one.
 */
export function ParentLink() {
  const {
    node: { nodeHierarchy },
    action,
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const { t } = useTranslation('breadcrumbs');

  if (!nodeHierarchy.parentAddress) {
    return null;
  }

  return (
    <Link
      color="gold.500"
      _hover={{ textDecoration: 'none', color: 'gold.500-hover' }}
      href={DAO_ROUTES.dao.relative(addressPrefix, nodeHierarchy.parentAddress)}
      onClick={action.resetDAO}
      marginBottom="1rem"
      as={RouterLink}
    >
      <HStack>
        <Image
          alignSelf="center"
          width="1.5rem"
          height="1.5rem"
          src="/images/arrow-up-left.svg"
          alt={t('parentLink')}
        />
        <Text
          textStyle="text-base-mono-bold"
          flexWrap="wrap"
        >
          {t('parentLink')}
        </Text>
      </HStack>
    </Link>
  );
}
