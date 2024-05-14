import { Flex, Text, Hide, Show } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import { createAccountSubstring } from '../../../../hooks/utils/useDisplayName';
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
          <Text mt={2}>{t('modulesAndGuardsDescription1')}</Text>
          <Text mt={4}>{t('modulesAndGuardsDescription2')}</Text>
        </>
      }
      nestedSection={{
        title: t('guardTitle'),
        children:
          safe?.guard && safe?.guard !== zeroAddress ? (
            <Flex>
              <DisplayAddress address={safe.guard}>
                {safe.guard}
                {!!freezeGuardContractAddress || !!freezeVotingContractAddress
                  ? ' (Freeze Guard)'
                  : ''}
              </DisplayAddress>
            </Flex>
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
            fractalModules.map(({ moduleAddress, moduleType }) => {
              const moduleHelper =
                moduleType === FractalModuleType.AZORIUS
                  ? ' (Azorius Module)'
                  : moduleType === FractalModuleType.FRACTAL
                    ? ' (Fractal Module)' // TODO rename this after renaming and redeploying contracts
                    : '';
              return (
                <Flex key={moduleAddress}>
                  <DisplayAddress address={moduleAddress}>
                    <Hide above="md">{createAccountSubstring(moduleAddress)}</Hide>
                    <Show above="md">{moduleAddress}</Show>
                    {moduleHelper && (
                      <Text
                        as="span"
                        display="flex"
                      >
                        {moduleHelper}
                      </Text>
                    )}
                  </DisplayAddress>
                </Flex>
              );
            })
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
