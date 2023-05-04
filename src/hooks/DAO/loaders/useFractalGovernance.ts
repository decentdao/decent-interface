import { useQuery } from '@apollo/client';
import { constants } from 'ethers';
import { useEffect, useRef } from 'react';
import { DAOQueryDocument } from '../../../../.graphclient';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import { useAzoriusStrategy } from './governance/useERC20LinearStrategy';
import { useERC20LinearToken } from './governance/useERC20LinearToken';
import { useDAOProposals } from './useProposals';

export const useFractalGovernance = () => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string>();

  const {
    node: {
      daoAddress,
      nodeHierarchy: { parentAddress },
    },
    governanceContracts,
    guardContracts,
    action,
  } = useFractal();

  const loadDAOProposals = useDAOProposals();
  const loadAzoriusStrategy = useAzoriusStrategy();
  const { loadERC20Token, loadUnderlyingERC20Token } = useERC20LinearToken({});

  const ONE_MINUTE = 60 * 1000;

  useQuery(DAOQueryDocument, {
    variables: { daoAddress },
    onCompleted: async data => {
      if (!daoAddress) return;
      const { daos } = data;
      const dao = daos[0];

      if (dao) {
        const { proposalTemplates } = dao;

        if (!!proposalTemplates) {
          action.dispatch({
            type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES,
            payload: proposalTemplates,
          });
        }
      }
    },
    pollInterval: ONE_MINUTE,
  });

  useEffect(() => {
    const { isLoaded, azoriusContract } = governanceContracts;
    if (parentAddress && guardContracts.freezeGuardType === null) {
      return;
    }
    if (
      isLoaded &&
      !!daoAddress &&
      daoAddress + guardContracts.freezeGuardType !== currentValidAddress.current
    ) {
      currentValidAddress.current =
        daoAddress + guardContracts.freezeGuardType || constants.AddressZero;
      loadDAOProposals();
      if (!!azoriusContract) {
        // load DAO voting strategy data
        loadAzoriusStrategy();
        // load voting token
        loadERC20Token();
        loadUnderlyingERC20Token();
      }
    } else if (!isLoaded) {
      currentValidAddress.current = undefined;
    }
  }, [
    daoAddress,
    parentAddress,
    governanceContracts,
    loadDAOProposals,
    loadUnderlyingERC20Token,
    guardContracts,
    loadAzoriusStrategy,
    loadERC20Token,
  ]);
};
