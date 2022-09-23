import { useEffect } from 'react';

import { GnosisWrapper } from '../../../assets/typechain-types/gnosis-wrapper';
import { logError } from '../../../helpers/errorLogging';
import { GnosisActions, GnosisActionTypes } from '../types';

const useGnosisSafeAddress = (
  gnosisWrapper: GnosisWrapper | undefined,
  dispatch: React.Dispatch<GnosisActionTypes>
) => {
  useEffect(() => {
    if (!gnosisWrapper) {
      dispatch({ type: GnosisActions.RESET });
      return;
    }

    gnosisWrapper
      .gnosisSafe()
      .then(safeAddress => {
        dispatch({ type: GnosisActions.UPDATE_GNOSIS_CONTRACT, payload: { safeAddress } });
      })
      .catch(logError);
  }, [gnosisWrapper, dispatch]);
};

export default useGnosisSafeAddress;
