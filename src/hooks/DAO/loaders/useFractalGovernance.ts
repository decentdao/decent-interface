import { useQuery } from '@apollo/client';
import { useEffect, useRef } from 'react';
import { DAOQueryDocument } from '../../../../.graphclient';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { FractalGovernanceAction } from '../../../providers/App/governance/action';
import useIPFSClient from '../../../providers/App/hooks/useIPFSClient';
import { ProposalTemplate } from '../../../types/createProposalTemplate';
import { useAzoriusStrategy } from './governance/useERC20LinearStrategy';
import { useERC20LinearToken } from './governance/useERC20LinearToken';
import { useDAOProposals } from './useProposals';

export const useFractalGovernance = () => {
  // load key for component; helps prevent unnecessary calls
  const loadKey = useRef<string>();

  const {
    node: { daoAddress },
    governanceContracts,
    action,
  } = useFractal();

  const loadDAOProposals = useDAOProposals();
  const loadAzoriusStrategy = useAzoriusStrategy();
  const { loadERC20Token, loadUnderlyingERC20Token } = useERC20LinearToken({});
  const ipfsClient = useIPFSClient();

  const ONE_MINUTE = 60 * 1000;

  const parseProposalTemplatesJSON = async (
    hash?: string | null
  ): Promise<ProposalTemplate[] | undefined> => {
    if (!hash) {
      return undefined;
    }

    const templatesConfigFile = ipfsClient.cat(hash);
    try {
      for await (const chunk of templatesConfigFile) {
        const data = JSON.parse(Buffer.from(chunk).toString('utf8'));
        // Sanity check
        return data.map((proposalTemplate: ProposalTemplate) => ({
          title: proposalTemplate.title,
          description: proposalTemplate.description,
          transactions: proposalTemplate.transactions,
        }));
      }
    } catch (e) {
      logError('Error parsing proposal templates JSON configuration file');
    }
  };

  useQuery(DAOQueryDocument, {
    variables: { daoAddress },
    onCompleted: async data => {
      if (!daoAddress) return;
      const { daos } = data;
      const dao = daos[0];

      if (dao) {
        const { proposalTemplatesHash } = dao;

        const proposalTemplates = await parseProposalTemplatesJSON(proposalTemplatesHash);

        action.dispatch({
          type: FractalGovernanceAction.SET_PROPOSAL_TEMPLATES,
          payload: proposalTemplates || [],
        });
      }
    },
    pollInterval: ONE_MINUTE,
  });

  useEffect(() => {
    const { isLoaded, azoriusContract } = governanceContracts;

    const newLoadKey = daoAddress + (azoriusContract ? '1' : '0');

    if (isLoaded && daoAddress && newLoadKey !== loadKey.current) {
      loadKey.current = newLoadKey;

      loadDAOProposals();

      if (azoriusContract) {
        loadAzoriusStrategy();
        loadERC20Token();
        loadUnderlyingERC20Token();
      }
    } else if (!isLoaded) {
      loadKey.current = undefined;
    }
  }, [
    daoAddress,
    governanceContracts,
    loadDAOProposals,
    loadUnderlyingERC20Token,
    loadAzoriusStrategy,
    loadERC20Token,
  ]);
};
