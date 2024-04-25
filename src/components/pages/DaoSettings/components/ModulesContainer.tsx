import { Box, Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalModuleType } from '../../../../types';
import { DisplayAddress } from '../../../ui/links/DisplayAddress';
import { BarLoader } from '../../../ui/loaders/BarLoader';
import { SettingsSection } from './SettingsSection';

function NoModuleAttached({ translationKey }: { translationKey: string }) {
  const { t } = useTranslation('settings');

  return <Text color="neutral-5">{t(translationKey)}</Text>;
}

export function ModulesContainer() {
  const { t } = useTranslation(['settings']);
  const {
    node: { fractalModules, isModulesLoaded, safe },
    guardContracts: { freezeGuardContractAddress, freezeVotingContractAddress },
  } = useFractal();

  return (
    <SettingsSection
      title={t('modulesTitle')}
      descriptionHeader={t('modulesAndGuardsTitle')}
      descriptionContent={
        <>
          <Text
            textStyle="text-sm-sans-regular"
            color="chocolate.200"
            mt={2}
          >
            {t('modulesAndGuardsDescription1')}
          </Text>
          <Text
            textStyle="text-sm-sans-regular"
            color="chocolate.200"
            mt={4}
          >
            {t('modulesAndGuardsDescription2')}
          </Text>
        </>
      }
      nestedSection={{
        title: t('guardTitle'),
        children:
          safe?.guard && safe?.guard !== zeroAddress ? (
            <Box>
              <DisplayAddress address={safe.guard}>
                {safe.guard}
                {!!freezeGuardContractAddress || !!freezeVotingContractAddress
                  ? ' (Freeze Guard)'
                  : ''}
              </DisplayAddress>
            </Box>
          ) : (
            <NoModuleAttached translationKey="noGuardAttached" />
          ),
      }}
    >
      <Flex
        flexDirection="column"
        gap="1rem"
        mt={4}
      >
        {isModulesLoaded ? (
          fractalModules.length > 0 ? (
            fractalModules.map(({ moduleAddress, moduleType }, i) => (
              <Box
                key={moduleAddress}
                mt={1}
                mb={i === 0 ? 1 : 4}
              >
                <DisplayAddress address={moduleAddress}>
                  {moduleAddress}
                  {moduleType === FractalModuleType.AZORIUS
                    ? ' (Azorius Module)'
                    : moduleType === FractalModuleType.FRACTAL
                      ? ' (Fractal Module)'
                      : ''}
                </DisplayAddress>
              </Box>
            ))
          ) : (
            <NoModuleAttached translationKey="noModulesAttached" />
          )
        ) : (
          <BarLoader />
        )}
      </Flex>
    </SettingsSection>
  );
}
