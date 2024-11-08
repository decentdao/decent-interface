import { Show, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import { InfoGovernance } from '../../../../components/DaoDashboard/Info/InfoGovernance';
import { ERC20TokenContainer } from '../../../../components/SafeSettings/ERC20TokenContainer';
import { ERC721TokensContainer } from '../../../../components/SafeSettings/ERC721TokensContainer';
import { SettingsContentBox } from '../../../../components/SafeSettings/SettingsContentBox';
import { SignersContainer } from '../../../../components/SafeSettings/Signers/SignersContainer';
import { StyledBox } from '../../../../components/ui/containers/StyledBox';
import NestedPageHeader from '../../../../components/ui/page/Header/NestedPageHeader';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { GovernanceType } from '../../../../types';

export function SafeGovernanceSettingsPage() {
  const { t } = useTranslation('settings');
  const { addressPrefix } = useNetworkConfig();
  const {
    node: { daoAddress },
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
          backButtonHref={DAO_ROUTES.settings.relative(addressPrefix, daoAddress || zeroAddress)}
        />
      </Show>
      <SettingsContentBox
        display="flex"
        flexDirection="column"
        gap="3rem"
      >
        {(isERC20Governance || isERC721Governance) && (
          <StyledBox width="100%">
            <Text textStyle="display-lg">{t('daoSettingsGovernance')}</Text>
            <InfoGovernance showTitle={false} />
          </StyledBox>
        )}
        {isERC20Governance ? (
          <ERC20TokenContainer />
        ) : isERC721Governance ? (
          <ERC721TokensContainer />
        ) : isMultisigGovernance ? (
          <SignersContainer />
        ) : null}
      </SettingsContentBox>
    </>
  );
}
