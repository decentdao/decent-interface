import { useQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { DAOQueryDocument } from '../../../../.graphclient';
import { useSubgraphChainName } from '../../../graphql/utils';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { useERC20LinearStrategy } from './governance/useERC20LinearStrategy';
import { useERC20LinearToken } from './governance/useERC20LinearToken';
import { useERC721LinearStrategy } from './governance/useERC721LinearStrategy';
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
  const loadERC721Strategy = useERC721LinearStrategy();
  const { loadERC20Token, loadUnderlyingERC20Token } = useERC20LinearToken({});
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
    const { isLoaded, azoriusContract, erc721LinearVotingContract, ozLinearVotingContract } =
      governanceContracts;

    const newLoadKey =
      daoAddress +
      (azoriusContract ? '1' : '0') +
      nodeHierarchy.parentAddress +
      !!guardContracts.freezeGuardContract;

    if (isLoaded && daoAddress && newLoadKey !== loadKey.current) {
      loadKey.current = newLoadKey;

      if (azoriusContract) {
        if (ozLinearVotingContract) {
          loadERC20Strategy();
          loadERC20Token();
          loadUnderlyingERC20Token();
        } else if (erc721LinearVotingContract) {
          loadERC721Strategy();
        }
      }

      loadDAOProposals();
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
    nodeHierarchy.parentAddress,
    guardContracts.freezeGuardContract,
    loadERC721Strategy,
  ]);
};
