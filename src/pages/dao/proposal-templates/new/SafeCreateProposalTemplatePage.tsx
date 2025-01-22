import * as amplitude from '@amplitude/analytics-browser';
import { useEffect, useMemo, useState } from 'react';
import { Route, useLocation, useSearchParams } from 'react-router-dom';
import { ProposalBuilder, ShowNonceInputOnMultisig } from '../../../../components/ProposalBuilder';
import ProposalTransactionsForm from '../../../../components/ProposalBuilder/ProposalTransactionsForm';
import { DEFAULT_PROPOSAL } from '../../../../components/ProposalBuilder/constants';
import { logError } from '../../../../helpers/errorLogging';
import useCreateProposalTemplate from '../../../../hooks/DAO/proposal/useCreateProposalTemplate';
import { analyticsEvents } from '../../../../insights/analyticsEvents';
import useIPFSClient from '../../../../providers/App/hooks/useIPFSClient';
import { useDaoInfoStore } from '../../../../store/daoInfo/useDaoInfoStore';
import {
  CreateProposalSteps,
  ProposalBuilderMode,
  ProposalTemplate,
} from '../../../../types/proposalBuilder';

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
  const { safe } = useDaoInfoStore();

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

  const location = useLocation();

  const prevStepUrl = `${location.pathname.replace(CreateProposalSteps.TRANSACTIONS, CreateProposalSteps.METADATA)}${location.search}`;
  const nextStepUrl = `${location.pathname.replace(CreateProposalSteps.METADATA, CreateProposalSteps.TRANSACTIONS)}${location.search}`;

  return (
    <ProposalBuilder
      mode={ProposalBuilderMode.TEMPLATE}
      prevStepUrl={prevStepUrl}
      nextStepUrl={nextStepUrl}
      initialValues={initialProposalTemplate}
      prepareProposalData={prepareProposalTemplateProposal}
      contentRoute={(formikProps, pendingCreateTx, nonce) => {
        return (
          <Route
            path={CreateProposalSteps.TRANSACTIONS}
            element={
              <>
                <ProposalTransactionsForm
                  pendingTransaction={pendingCreateTx}
                  safeNonce={safe?.nextNonce}
                  isProposalMode={true}
                  {...formikProps}
                />
                <ShowNonceInputOnMultisig
                  nonce={nonce}
                  nonceOnChange={newNonce => formikProps.setFieldValue('nonce', newNonce)}
                />
              </>
            }
          />
        );
      }}
    />
  );
}
