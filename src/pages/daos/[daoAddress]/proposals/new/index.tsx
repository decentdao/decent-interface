import { Center } from '@chakra-ui/react';
import { useRef, useEffect } from 'react';
import { ProposalBuilder } from '../../../../../components/ProposalBuilder';
import { DEFAULT_PROPOSAL } from '../../../../../components/ProposalBuilder/constants';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import { useHeaderHeight } from '../../../../../constants/common';
import { usePrepareProposal } from '../../../../../hooks/DAO/proposal/usePrepareProposal';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useSafeAPI } from '../../../../../providers/App/hooks/useSafeAPI';
import { NodeAction } from '../../../../../providers/App/node/action';
import { ProposalBuilderMode } from '../../../../../types';

export default function CreateProposalPage() {
  const {
    action,
    node: { daoAddress, safe },
    governance: { type },
  } = useFractal();
  const safeAPI = useSafeAPI();
  const { prepareProposal } = usePrepareProposal();

  const HEADER_HEIGHT = useHeaderHeight();

  const isMounted = useRef(false);
  useEffect(() => {
    if (!safeAPI || !daoAddress || isMounted.current) {
      return;
    }

    (async () => {
      const safeInfo = await safeAPI.getSafeData(daoAddress);
      action.dispatch({
        type: NodeAction.SET_SAFE_INFO,
        payload: safeInfo,
      });
    })();

    isMounted.current = true;
  }, [action, daoAddress, safeAPI]);

  if (!type || !daoAddress || !safe) {
    return (
      <Center minH={`calc(100vh - ${HEADER_HEIGHT})`}>
        <BarLoader />
      </Center>
    );
  }

  return (
    <ProposalBuilder
      initialValues={{ ...DEFAULT_PROPOSAL, nonce: safe.nonce }}
      mode={ProposalBuilderMode.PROPOSAL}
      prepareProposalData={prepareProposal}
    />
  );
}
