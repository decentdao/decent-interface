import { useQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { DAOQueryDocument } from '../../../../.graphclient';
import { useSubgraphChainName } from '../../../graphql/utils';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useERC20LinearStrategy } from './governance/useERC20LinearStrategy';
import { useERC20LinearToken } from './governance/useERC20LinearToken';
import { useLockRelease } from './governance/useLockRelease';
import { useDAOProposals } from './useProposals';

export const useFractalGovernance = () => {
  // load key for component; helps prevent unnecessary calls
  const loadKey = useRef<string>();

  const {
    node: { daoAddress, nodeHierarchy },
    governanceContracts,
    action,
    guardContracts,
  } = useFractal();

  const loadDAOProposals = useDAOProposals();
  const loadERC20Strategy = useERC20LinearStrategy();
  const { loadERC20Token, loadUnderlyingERC20Token } = useERC20LinearToken({});
  const { loadLockedVotesToken } = useLockRelease({});
  const ipfsClient = useIPFSClient();

  const ONE_MINUTE = 60 * 1000;

  const chainName = useSubgraphChainName();

  useQuery(DAOQueryDocument, {
    variables: { daoAddress },
    onCompleted: async data => {
      if (!daoAddress) return;
      const { daos } = data;
      const dao = daos[0];

      if (dao) {
        const { proposalTemplatesHash } = dao;
        if (proposalTemplatesHash) {
          const proposalTemplates = await ipfsClient.cat(proposalTemplatesHash);

          action.dispatch({
            type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES,
            payload: proposalTemplates || [],
          });
        } else {
          action.dispatch({
            type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES,
            payload: [],
          });
        }
      } else {
        action.dispatch({
          type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES,
          payload: [],
        });
      }
    },
    context: { chainName },
    pollInterval: ONE_MINUTE,
    skip: !daoAddress,
  });

  useEffect(() => {
    const { isLoaded, azoriusContract, lockReleaseContract } = governanceContracts;

    const newLoadKey =
      daoAddress +
      (azoriusContract ? '1' : '0') +
      nodeHierarchy.parentAddress +
      !!guardContracts.freezeGuardContract;

    if (isLoaded && daoAddress && newLoadKey !== loadKey.current) {
      loadKey.current = newLoadKey;

      loadDAOProposals();

      if (azoriusContract) {
        loadERC20Strategy();
        loadERC20Token();
        loadUnderlyingERC20Token();
        if (lockReleaseContract) {
          loadLockedVotesToken();
        }
      }
    } else if (!isLoaded) {
      loadKey.current = undefined;
    }
  }, [
    daoAddress,
    governanceContracts,
    loadDAOProposals,
    loadUnderlyingERC20Token,
    loadERC20Strategy,
    loadERC20Token,
    loadLockedVotesToken,
    nodeHierarchy.parentAddress,
    guardContracts.freezeGuardContract,
  ]);
};
