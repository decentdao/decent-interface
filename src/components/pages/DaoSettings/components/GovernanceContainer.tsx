import { Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { GovernanceType } from '../../../../types';
import { InfoGovernance } from '../../DaoDashboard/Info/InfoGovernance';
import { ERC20TokenContainer } from './ERC20TokenContainer';
import { ERC721TokensContainer } from './ERC721TokensContainer';
import { SettingsSection } from './SettingsSection';
import { SignersContainer } from './Signers/SignersContainer';

export default function GovernanceContainer() {
  const { t } = useTranslation('settings');
  const { governance } = useFractal();
  const { type } = governance;
  const isERC20Governance = type === GovernanceType.AZORIUS_ERC20;
  const isERC721Governance = type === GovernanceType.AZORIUS_ERC721;
  const isMultisigGovernance = type === GovernanceType.MULTISIG;

  return (
    <Flex
      flexDirection="column"
      gap="3rem"
    >
      {(isERC20Governance || isERC721Governance) && (
        <SettingsSection
          title={t('daoSettingsGovernance')}
          descriptionHeader={t('governanceParametersTitle')}
          descriptionContent={t('governanceParametersDescription')}
        >
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
  );
}
