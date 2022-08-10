import { BigNumber } from 'ethers';
import { useState, useEffect } from 'react';
import { GovernorModule } from '../../../assets/typechain-types/module-governor';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { UserVote, VoteCastListener } from '../types';

export const useUserVotes = (governorModule: GovernorModule | undefined) => {
  const {
    state: { account },
  } = useWeb3Provider();
  const [userVotes, setUserVotes] = useState<UserVote[]>();

  // Get all of the current users votes
  useEffect(() => {
    if (governorModule === undefined || account === undefined) {
      setUserVotes(undefined);
      return;
    }

    const filter = governorModule.filters.VoteCast(account);

    governorModule
      .queryFilter(filter)
      .then(voteCastEvents => {
        setUserVotes(
          voteCastEvents.map(voteCastEvent => {
            const userVote: UserVote = {
              proposalId: voteCastEvent.args.proposalId,
              vote: voteCastEvent.args.support,
            };
            return userVote;
          })
        );
      })
      .catch(console.error);
  }, [governorModule, account]);

  // Setup user vote events listener
  useEffect(() => {
    if (governorModule === undefined) {
      setUserVotes(undefined);
      return;
    }

    const filter = governorModule.filters.VoteCast(account);

    const listenerCallback: VoteCastListener = (
      _voter: string,
      proposalId: BigNumber,
      support: number
    ) => {
      const newUserVote: UserVote = {
        proposalId: proposalId,
        vote: support,
      };

      setUserVotes(existingUserVotes => {
        if (existingUserVotes === undefined) {
          return undefined;
        }

        return [...existingUserVotes, newUserVote];
      });
    };

    governorModule.on(filter, listenerCallback);

    return () => {
      governorModule.off(filter, listenerCallback);
    };
  }, [account, governorModule]);

  return userVotes;
};
