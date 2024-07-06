import { Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../ui/cards/Card';
import { BarLoader } from '../../ui/loaders/BarLoader';

export function RoleCardLoading() {
  return (
    <Card
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="4rem"
    >
      <BarLoader />
    </Card>
  );
}

export function RoleCardNoRoles() {
  const { t } = useTranslation('roles');
  return (
    <Card my="0.5rem">
      <Text
        textStyle="body-base"
        textAlign="center"
        color="white-alpha-16"
      >
        {t('noRoles')}
      </Text>
    </Card>
  );
}
