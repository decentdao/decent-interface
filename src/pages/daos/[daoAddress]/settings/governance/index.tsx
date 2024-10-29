import { Flex, Hide, Show } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { InfoGovernance } from '../../../../../components/pages/DaoDashboard/Info/InfoGovernance';
import { ERC20TokenContainer } from '../../../../../components/pages/SafeSettings/ERC20TokenContainer';
import { ERC721TokensContainer } from '../../../../../components/pages/SafeSettings/ERC721TokensContainer';
import { SettingsSection } from '../../../../../components/pages/SafeSettings/SettingsSection';
import { SignersContainer } from '../../../../../components/pages/SafeSettings/Signers/SignersContainer';
import NestedPageHeader from '../../../../../components/ui/page/Header/NestedPageHeader';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { GovernanceType } from '../../../../../types';

export default function SafeGovernanceSettingsPage() {
  const { t } = useTranslation('settings');
  const {
    governance: { type },
  } = useFractal();

  const isERC20Governance =
    type === GovernanceType.AZORIUS_ERC20 ||
    type === GovernanceType.AZORIUS_ERC20_HATS_WHITELISTING;
  const isERC721Governance =
    type === GovernanceType.AZORIUS_ERC721 ||
    type === GovernanceType.AZORIUS_ERC721_HATS_WHITELISTING;
  const isMultisigGovernance = type === GovernanceType.MULTISIG;

  return (
    <>
      <Show below="md">
        <NestedPageHeader
          title={t('daoSettingsGovernance')}
          backButtonText={t('settings')}
        />
      </Show>
      <Hide below="md"></Hide>
      <Flex
        flexDirection="column"
        gap="3rem"
      >
        {(isERC20Governance || isERC721Governance) && (
          <SettingsSection title={t('daoSettingsGovernance')}>
            <InfoGovernance showTitle={false} />
          </SettingsSection>
        )}
        {isERC20Governance ? (
          <ERC20TokenContainer />
        ) : isERC721Governance ? (
          <ERC721TokensContainer />
        ) : isMultisigGovernance ? (
          <SignersContainer />
        ) : null}
      </Flex>
    </>
  );
}
