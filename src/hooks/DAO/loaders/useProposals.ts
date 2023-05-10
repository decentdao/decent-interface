import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { useCallback } from 'react';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { StrategyType } from '../../../types';
import { useUpdateTimer } from '../../utils/useUpdateTimer';
import { useAzoriusProposals } from './governance/useAzoriusProposals';
import { useSafeMultisigProposals } from './governance/useSafeMultisigProposals';

export const useDAOProposals = () => {
  const {
    node: { daoAddress },
    governanceContracts,
    action,
  } = useFractal();

  const loadAzoriusProposals = useAzoriusProposals();
  const loadSafeMultisigProposals = useSafeMultisigProposals();
  const { setMethodOnInterval } = useUpdateTimer(daoAddress);
  const loadDAOProposals = useCallback(async () => {
    const { azoriusContract } = governanceContracts;

    if (!!azoriusContract) {
      // load Azorius proposals and strategies
      action.dispatch({
        type: FractalGovernanceAction.SET_PROPOSALS,
        payload: {
          type: StrategyType.AZORIUS,
          proposals: await loadAzoriusProposals(),
        },
      });
    } else {
      // load mulisig proposals
      setMethodOnInterval(loadSafeMultisigProposals);
    }
  }, [
    governanceContracts,
    loadAzoriusProposals,
    action,
    loadSafeMultisigProposals,
    setMethodOnInterval,
  ]);

  return loadDAOProposals;
};

export const useSnapshotProposals = () => {
  const {
    node: { daoSnapshotURL },
  } = useFractal();

  const loadSnapshotProposals = useCallback(async () => {
    console.log('loading snapshot proposals, ', daoSnapshotURL);
    const client = new ApolloClient({
      uri: 'https://testnet.snapshot.org/graphql',
      cache: new InMemoryCache(),
    });

    client
      .query({
        query: gql`
      query Proposals {
        proposals(
          where: {
            space_in: ["${daoSnapshotURL}"]
          },
          orderBy: "created",
          orderDirection: desc
        ) {
          id
          title
          body
          choices
          start
          end
          snapshot
          state
          author
          space {
            id
            name
          }
        }
      }
      `,
      })
      .then(result => console.log(result));
  }, [daoSnapshotURL]);

  return loadSnapshotProposals;
};
