import { useState, useEffect } from 'react';
import { GovernorModule } from '../../../assets/typechain-types/module-governor';
import useBlockchainDatas from '../../../contexts/blockchainData/blockchainData';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { logError } from '../../../helpers/errorLogging';
import { ProposalDataWithoutUserData, UserVotePower } from '../types';
import { getUserVotePower } from '../utils';

export const useUserVotePowers = (
  proposalsWithoutUserData: ProposalDataWithoutUserData[] | undefined,
  governorModule: GovernorModule | undefined
) => {
  const {
    state: { account },
  } = useWeb3Provider();
  const { currentBlockNumber } = useBlockchainDatas();
  const [userVotePowers, setUserVotePowers] = useState<UserVotePower[]>();

  // Get user vote power
  useEffect(() => {
    if (
      governorModule === undefined ||
      !account ||
      currentBlockNumber === undefined ||
      proposalsWithoutUserData === undefined
    ) {
      setUserVotePowers(undefined);
      return;
    }

    Promise.all(
      proposalsWithoutUserData.map(proposalWithoutUserData => {
        return getUserVotePower(
          governorModule,
          account,
          proposalWithoutUserData.startBlock.toNumber(),
          currentBlockNumber
        );
      })
    )
      .then(newUserVotePowerValues => {
        setUserVotePowers(
          proposalsWithoutUserData.map((proposal, index) => {
            const newUserVotePower: UserVotePower = {
              proposalId: proposal.id,
              votePower: newUserVotePowerValues[index],
            };

            return newUserVotePower;
          })
        );
      })
      .catch(logError);
  }, [governorModule, account, currentBlockNumber, proposalsWithoutUserData]);

  return userVotePowers;
};
