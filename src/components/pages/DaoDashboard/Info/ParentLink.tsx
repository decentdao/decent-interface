import { Link, HStack, Image, Text, LinkProps } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useTranslation } from 'react-i18next';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';

/**
 * Displays a link to the current DAO's parent, if it has one.
 */
export function ParentLink({ ...rest }: LinkProps) {
  const {
    node: { nodeHierarchy },
  } = useFractal();
  const { t } = useTranslation('breadcrumbs');

  if (!nodeHierarchy.parentAddress) {
    return null;
  }

  return (
    <Link
      color="gold.500"
      _hover={{ textDecoration: 'none', color: 'gold.500-hover' }}
      href={DAO_ROUTES.dao.relative(nodeHierarchy.parentAddress)}
      marginBottom="1rem"
      as={NextLink}
      {...rest}
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
