import * as amplitude from '@amplitude/analytics-browser';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProposalBuilder } from '../../../../components/ProposalBuilder';
import { DEFAULT_PROPOSAL } from '../../../../components/ProposalBuilder/constants';
import { logError } from '../../../../helpers/errorLogging';
import useCreateProposalTemplate from '../../../../hooks/DAO/proposal/useCreateProposalTemplate';
import { analyticsEvents } from '../../../../insights/analyticsEvents';
import useIPFSClient from '../../../../providers/App/hooks/useIPFSClient';
import { ProposalBuilderMode, ProposalTemplate } from '../../../../types/proposalBuilder';

export function SafeCreateProposalTemplatePage() {
  useEffect(() => {
    amplitude.track(analyticsEvents.CreateProposalTemplatePageOpened);
  }, []);

  const ipfsClient = useIPFSClient();
  const [initialProposalTemplate, setInitialProposalTemplate] = useState(DEFAULT_PROPOSAL);
  const { prepareProposalTemplateProposal } = useCreateProposalTemplate();
  const [searchParams] = useSearchParams();
  const defaultProposalTemplatesHash = useMemo(
    () => searchParams?.get('templatesHash'),
    [searchParams],
  );
  const defaultProposalTemplateIndex = useMemo(
    () => searchParams?.get('templateIndex'),
    [searchParams],
  );

  useEffect(() => {
    const loadInitialTemplate = async () => {
      if (defaultProposalTemplatesHash && defaultProposalTemplateIndex) {
        try {
          const proposalTemplates = await ipfsClient.cat(defaultProposalTemplatesHash);
          const initialTemplate: ProposalTemplate = proposalTemplates[defaultProposalTemplateIndex];
          if (initialTemplate) {
            const newInitialValue = {
              nonce: undefined,
              proposalMetadata: {
                title: initialTemplate.title,
                description: initialTemplate.description || '',
              },
              transactions: initialTemplate.transactions.map(tx => ({
                ...tx,
                ethValue: {
                  value: tx.ethValue.value,
                  bigintValue: tx.ethValue.value !== '' ? BigInt(tx.ethValue.value) : undefined,
                },
              })),
            };
            setInitialProposalTemplate(newInitialValue);
          }
        } catch (e) {
          logError('Error while fetching initial template values', e);
        }
      }
    };
    loadInitialTemplate();
  }, [defaultProposalTemplatesHash, defaultProposalTemplateIndex, ipfsClient]);

  return (
    <ProposalBuilder
      mode={ProposalBuilderMode.TEMPLATE}
      initialValues={initialProposalTemplate}
      prepareProposalData={prepareProposalTemplateProposal}
    />
  );
}
