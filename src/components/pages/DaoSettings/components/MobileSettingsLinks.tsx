import { Box, Flex, Text } from '@chakra-ui/react';
import { Bank, CaretRight, CheckSquare, GearFine, Stack } from '@phosphor-icons/react';
import { PropsWithChildren, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useFractal } from '../../../../providers/App/AppProvider';
import { AzoriusGovernance } from '../../../../types';
import { Card } from '../../../ui/cards/Card';
import { BarLoader } from '../../../ui/loaders/BarLoader';
import Divider from '../../../ui/utils/Divider';

function SettingsLink({
  path,
  title,
  leftIcon,
  children,
  showDivider = true,
}: PropsWithChildren<{ path: string; title: string; leftIcon: ReactNode; showDivider?: boolean }>) {
  const { search } = useLocation();
  return (
    <Box
      as={Link}
      to={`${path}${search}`}
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
      >
        <Flex
          gap={4}
          alignItems="center"
          color="lilac-0"
        >
          {leftIcon}
          <Text
            textStyle="body-base"
            color="white-0"
          >
            {title}
          </Text>
        </Flex>
        <Flex
          alignItems="center"
          color="neutral-6"
          gap={2}
        >
          {children}
          <CaretRight />
        </Flex>
      </Flex>
      {showDivider && (
        <Divider
          variant="darker"
          width="calc(100% + 2rem)"
          mx="-1rem"
          my="1rem"
        />
      )}
    </Box>
  );
}

export default function MobileSettingsLinks() {
  const { t } = useTranslation('settings');
  const {
    governance,
    node: { fractalModules, safe },
  } = useFractal();
  const azoriusGovernance = governance as AzoriusGovernance;

  if (!safe) {
    return (
      <Flex
        h="8.5rem"
        width="100%"
        alignItems="center"
        justifyContent="center"
      >
        <BarLoader />
      </Flex>
    );
  }

  return (
    <Card>
      <SettingsLink
        path="general"
        leftIcon={<GearFine fontSize="1.5rem" />}
        title={t('daoSettingsGeneral')}
      />
      <SettingsLink
        path="governance"
        leftIcon={<Bank fontSize="1.5rem" />}
        title={t('daoSettingsGovernance')}
      >
        <Text
          textStyle="body-base"
          color="neutral-7"
        >
          {t(azoriusGovernance.votingStrategy?.strategyType ?? 'labelMultisig')}
        </Text>
      </SettingsLink>
      <SettingsLink
        path="modules-and-guard"
        leftIcon={<Stack fontSize="1.5rem" />}
        title={t('daoModulesAndGuard')}
      >
        <Text
          textStyle="body-base"
          color="neutral-7"
        >
          {fractalModules.length + safe.guard ? 1 : 0}
        </Text>
      </SettingsLink>
      <SettingsLink
        path="permissions"
        leftIcon={<CheckSquare fontSize="1.5rem" />}
        title={t('permissionsTitle')}
        showDivider={false}
      >
        <Text
          textStyle="body-base"
          color="neutral-7"
        >
          {azoriusGovernance.votingStrategy ? 1 : 0}
        </Text>
      </SettingsLink>
    </Card>
  );
}
