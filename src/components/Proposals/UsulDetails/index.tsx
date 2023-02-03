import { GridItem } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ProposalAction } from '../../../components/Proposals/ProposalActions/ProposalAction';
import ProposalSummary from '../../../components/Proposals/ProposalSummary';
import ProposalVotes from '../../../components/Proposals/ProposalVotes';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import useTokenData from '../../../providers/Fractal/governance/hooks/useGovernanceTokenData';
import useUpdateProposalState from '../../../providers/Fractal/governance/hooks/useUpdateProposalState';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { TxProposalState, UsulProposal } from '../../../providers/Fractal/types';
import ContentBox from '../../ui/containers/ContentBox';
import { ProposalDetailsGrid } from '../../ui/containers/ProposalDetailsGrid';
import { ProposalInfo } from '../ProposalInfo';

export function UsulProposalDetails({ proposal }: { proposal: UsulProposal }) {
  const [activeTimeout, setActiveTimeout] = useState<NodeJS.Timeout>();
  const {
    governance,
    dispatches: { governanceDispatch },
  } = useFractal();
  const { timeLockPeriod } = useTokenData(governance.contracts);
  const updateProposalState = useUpdateProposalState({ governance, governanceDispatch });

  const { address: account } = useAccount();

  useEffect(() => {
    let timeout = 0;
    const now = new Date();
    if (proposal.state === TxProposalState.Active) {
      timeout = proposal.deadline * 1000 - now.getTime();
    } else if (proposal.state === TxProposalState.TimeLocked) {
      const timeLockNumber = timeLockPeriod?.value?.toNumber();
      timeout =
        new Date(proposal.deadline + Number(timeLockNumber) * 1000).getTime() - now.getTime();
    }

    // Prevent setting too large timer
    if (timeout > 0 && timeout < 86400) {
      setActiveTimeout(
        setTimeout(
          () => updateProposalState(BigNumber.from(proposal.proposalNumber)),
          timeout + 60000 // add extra 60 seconds to ensure that we woulnd't encounter issue while trying to update status in same minute as it supposed to change
        )
      );
    }

    return () => {
      clearTimeout(activeTimeout);
    };
    // eslint-disable-next-line
  }, [
    timeLockPeriod,
    proposal.state,
    proposal.proposalNumber,
    proposal.deadline,
    updateProposalState,
  ]);

  return (
    <ProposalDetailsGrid>
      <GridItem colSpan={2}>
        <ContentBox bg={BACKGROUND_SEMI_TRANSPARENT}>
          <ProposalInfo proposal={proposal} />
        </ContentBox>
        <ProposalVotes proposal={proposal} />
      </GridItem>
      <GridItem>
        <ProposalSummary proposal={proposal} />
        {account && (
          <ProposalAction
            proposal={proposal}
            expandedView
          />
        )}
      </GridItem>
    </ProposalDetailsGrid>
  );
}
