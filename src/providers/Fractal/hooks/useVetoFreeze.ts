import {
  UsulVetoGuard__factory,
  VetoERC20Voting,
  VetoERC20Voting__factory,
  VetoGuard__factory,
  VetoMultisigVoting,
  VetoMultisigVoting__factory,
} from '@fractal-framework/fractal-contracts';
import { guard } from '@fractal-framework/fractal-contracts/dist/typechain-types/@gnosis.pm/zodiac/contracts';
import { FreezeVoteCastEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/VetoERC20Voting';
import { BigNumber, ethers } from 'ethers';
import { Dispatch, useEffect } from 'react';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { useWeb3Provider } from '../../Web3Data/hooks/useWeb3Provider';
import { GnosisAction } from '../constants';
import { GnosisActions, GnosisModuleType, IGnosisModuleData } from '../types';
import { IGnosisVetoData } from '../types/governance';
import { FreezeVoteCastedListener } from '../types/vetoVoting';

export function useVetoFreeze(
  // eslint-disable-next-line @typescript-eslint/no-shadow
  guard: IGnosisVetoData,
  gnosisDispatch: Dispatch<GnosisActions>,
  vetoGuardContract: VetoMultisigVoting
) {
  const {
    state: { account },
  } = useWeb3Provider();

  useEffect(() => {
    if (!vetoGuardContract || !account) {
      return;
    }

    const filter = vetoGuardContract.filters.FreezeVoteCast();

    const listenerCallback: FreezeVoteCastedListener = () => {
      gnosisDispatch({
        type: GnosisAction.SET_GUARD,
        payload: {
          ...guard,
          freezeProposalVoteCount: guard.freezeProposalVoteCount.add(1),
        },
      });
    };

    vetoGuardContract.on(filter, listenerCallback);

    return () => {
      vetoGuardContract.off(filter, listenerCallback);
    };
  }, [account, guard, vetoGuardContract, gnosisDispatch]);
}
