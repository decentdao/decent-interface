import { Flex } from '@chakra-ui/react';
import { useFractal } from '../../../../providers/App/AppProvider';
import { GovernanceType } from '../../../../types';
import { ERC20TokenContainer } from './ERC20TokenContainer';
import { ERC721TokensContainer } from './ERC721TokensContainer';
import { SettingsSection } from './SettingsSection';
import { SignersContainer } from './Signers/SignersContainer';

export default function GovernanceContainer() {
  const {
    governance: { type },
  } = useFractal();
  return (
    <Flex
      flexDirection="column"
      gap="3rem"
    >
      <SettingsSection
        title="Governance"
        descriptionHeader="blah blah governance and token"
        descriptionContent="blah blah governance long ass description"
      >
        I am going to show quorum, voting period, timelock period, execution period
      </SettingsSection>
      {type === GovernanceType.AZORIUS_ERC20 ? (
        <ERC20TokenContainer />
      ) : type === GovernanceType.AZORIUS_ERC721 ? (
        <ERC721TokensContainer />
      ) : type === GovernanceType.MULTISIG ? (
        <SignersContainer />
      ) : null}
    </Flex>
  );
}
