import { HStack, Icon, Link, Text } from '@chakra-ui/react';
import { ArrowBendLeftUp } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { DAO_ROUTES } from '../../../constants/routes';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';
/**
 * Displays a link to the current DAO's parent, if it has one.
 */
export function ParentLink() {
  const { nodeHierarchy } = useDaoInfoStore();
  const { addressPrefix } = useNetworkConfig();
  const { t } = useTranslation('breadcrumbs');

  if (!nodeHierarchy.parentAddress) {
    return null;
  }

  return (
    <Link
      color="celery-0"
      _hover={{ textDecoration: 'none', color: 'celery--6' }}
      to={DAO_ROUTES.dao.relative(addressPrefix, nodeHierarchy.parentAddress)}
      marginBottom="1rem"
      as={RouterLink}
      width="fit-content"
    >
      <HStack>
        <Icon
          color="lilac-0"
          as={ArrowBendLeftUp}
          width="1.5rem"
          height="1.5rem"
        />
        <Text flexWrap="wrap">{t('parentLink')}</Text>
      </HStack>
    </Link>
  );
}
