import { Flex, Hide, Show, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import { SettingsContentBox } from '../../../../components/SafeSettings/SettingsContentBox';
import { DisplayAddress } from '../../../../components/ui/links/DisplayAddress';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import NestedPageHeader from '../../../../components/ui/page/Header/NestedPageHeader';
import Divider from '../../../../components/ui/utils/Divider';
import { DAO_ROUTES } from '../../../../constants/routes';
import { createAccountSubstring } from '../../../../hooks/utils/useGetAccountName';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../../../store/daoInfo/useDaoInfoStore';
import { FractalModuleType } from '../../../../types';

export function SafeModulesSettingsPage() {
  const { t } = useTranslation('settings');
  const { addressPrefix } = useNetworkConfig();
  const {
    guardContracts: { freezeGuardContractAddress, freezeVotingContractAddress },
  } = useFractal();
  const { fractalModules, isModulesLoaded, safe } = useDaoInfoStore();

  return (
    <>
      <Show below="md">
        <NestedPageHeader
          title={t('daoModulesAndGuard')}
          backButton={{
            text: t('settings'),
            href: DAO_ROUTES.settings.relative(addressPrefix, safe?.address || zeroAddress),
          }}
        />
      </Show>
      <SettingsContentBox>
        <Flex
          flexDirection="column"
          gap="1rem"
        >
          <Text textStyle="display-lg">{t('daoModulesAndGuard')}</Text>
          <Divider
            w={{ base: 'calc(100% + 1.5rem)', md: 'calc(100% + 3rem)' }}
            mx={{ base: '-0.75rem', md: '-1.5rem' }}
          />
          {isModulesLoaded ? (
            fractalModules.length > 0 ? (
              fractalModules.map(({ moduleAddress, moduleType }) => {
                const moduleHelper =
                  moduleType === FractalModuleType.AZORIUS
                    ? ' (Azorius Module)'
                    : moduleType === FractalModuleType.FRACTAL
                      ? ' (Fractal Module)' // @todo rename this after renaming and redeploying contracts
                      : '';
                return (
                  <Flex key={moduleAddress}>
                    <DisplayAddress address={moduleAddress}>
                      <Hide above="xl">{createAccountSubstring(moduleAddress)}</Hide>
                      <Show above="xl">{moduleAddress}</Show>
                      {moduleHelper && <Text as="span">{moduleHelper}</Text>}
                    </DisplayAddress>
                  </Flex>
                );
              })
            ) : (
              <Text color="neutral-5">{t('noModulesAttached')}</Text>
            )
          ) : (
            <BarLoader />
          )}
        </Flex>
        <Flex
          flexDir="column"
          mt="2rem"
        >
          <Text textStyle="display-lg">{t('guardTitle')}</Text>
          <Divider
            my="1rem"
            w={{ base: 'calc(100% + 1.5rem)', md: 'calc(100% + 3rem)' }}
            mx={{ base: '-0.75rem', md: '-1.5rem' }}
          />
          {safe?.guard && safe?.guard !== zeroAddress ? (
            <Flex>
              <DisplayAddress address={safe.guard}>
                {safe.guard}
                {!!freezeGuardContractAddress || !!freezeVotingContractAddress
                  ? ' (Freeze Guard)'
                  : ''}
              </DisplayAddress>
            </Flex>
          ) : (
            <Text color="neutral-5">{t('noGuardAttached')}</Text>
          )}
        </Flex>
      </SettingsContentBox>
    </>
  );
}
