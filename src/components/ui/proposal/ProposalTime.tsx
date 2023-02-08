import { Flex, Text, Tooltip } from '@chakra-ui/react';
import { VetoGuard } from '@fractal-framework/fractal-contracts';
import { SafeMultisigTransactionWithTransfersResponse } from '@safe-global/safe-service-client';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useTokenData from '../../../providers/Fractal/governance/hooks/useGovernanceTokenData';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import {
  TxProposal,
  UsulProposal,
  TxProposalState,
  VetoGuardType,
} from '../../../providers/Fractal/types';
import Execute from '../svg/Execute';
import Lock from '../svg/Lock';
import Vote from '../svg/Vote';
type ProposalTimeProps = {
  proposal: TxProposal;
};

const ICONS_MAP = {
  vote: Vote,
  lock: Lock,
  execute: Execute,
};

function ProposalTime({ proposal }: ProposalTimeProps) {
  const [countdown, setCountdown] = useState<number>();
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timer>();
  const { t } = useTranslation('proposal');
  const {
    governance: { contracts },
    gnosis: {
      guardContracts: { vetoGuardContract, vetoGuardType },
    },
  } = useFractal();
  const { timeLockPeriod } = useTokenData(contracts);
  const isActive = proposal.state === TxProposalState.Active;
  const isTimeLocked = proposal.state === TxProposalState.TimeLocked;
  const isQueued = proposal.state === TxProposalState.Queued;
  const isExecutable = proposal.state === TxProposalState.Executing;
  const showCountdown = isActive || isTimeLocked || isExecutable || isQueued;

  const usulProposal = proposal as UsulProposal;

  useEffect(() => {
    async function getCountdown() {
      const vetoGuard =
        vetoGuardType === VetoGuardType.MULTISIG
          ? (vetoGuardContract?.asSigner as VetoGuard)
          : undefined;

      if (countdownInterval) {
        clearInterval(countdownInterval);
      }

      if (isActive && usulProposal.deadline) {
        const interval = setInterval(() => {
          const now = new Date();
          setCountdown(usulProposal.deadline * 1000 - now.getTime());
        }, 1000);
        setCountdownInterval(interval);
      } else if (isTimeLocked && usulProposal.deadline && timeLockPeriod) {
        const interval = setInterval(() => {
          const now = new Date();
          setCountdown((usulProposal.deadline + Number(timeLockPeriod)) * 1000 - now.getTime());
        }, 1000);
        setCountdownInterval(interval);
      } else if (isQueued && vetoGuard) {
        const abiCoder = new ethers.utils.AbiCoder();

        const multiSigTransaction =
          proposal.transaction as SafeMultisigTransactionWithTransfersResponse;

        const vetoGuardTransactionHash = ethers.utils.solidityKeccak256(
          ['bytes'],
          [
            abiCoder.encode(
              [
                'address',
                'uint256',
                'bytes32',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'address',
                'address',
              ],
              [
                multiSigTransaction.to,
                multiSigTransaction.value,
                ethers.utils.solidityKeccak256(['bytes'], [multiSigTransaction.data as string]),
                multiSigTransaction.operation,
                multiSigTransaction.safeTxGas,
                multiSigTransaction.baseGas,
                multiSigTransaction.gasPrice,
                multiSigTransaction.gasToken,
                multiSigTransaction.refundReceiver as string,
              ]
            ),
          ]
        );
        const queuedTimestamp = (
          await vetoGuard.getTransactionQueuedTimestamp(vetoGuardTransactionHash)
        ).toNumber();
        const guardTimeLockPeriod = (await vetoGuard.timelockPeriod()).toNumber();
        const interval = setInterval(() => {
          const now = new Date();
          setCountdown(queuedTimestamp + guardTimeLockPeriod - now.getTime());
        }, 1000);
        setCountdownInterval(interval);
      } else if (isExecutable && vetoGuard) {
        const abiCoder = new ethers.utils.AbiCoder();

        const multiSigTransaction =
          proposal.transaction as SafeMultisigTransactionWithTransfersResponse;

        const vetoGuardTransactionHash = ethers.utils.solidityKeccak256(
          ['bytes'],
          [
            abiCoder.encode(
              [
                'address',
                'uint256',
                'bytes32',
                'uint256',
                'uint256',
                'uint256',
                'uint256',
                'address',
                'address',
              ],
              [
                multiSigTransaction.to,
                multiSigTransaction.value,
                ethers.utils.solidityKeccak256(['bytes'], [multiSigTransaction.data as string]),
                multiSigTransaction.operation,
                multiSigTransaction.safeTxGas,
                multiSigTransaction.baseGas,
                multiSigTransaction.gasPrice,
                multiSigTransaction.gasToken,
                multiSigTransaction.refundReceiver as string,
              ]
            ),
          ]
        );
        const queuedTimestamp = (
          await vetoGuard.getTransactionQueuedTimestamp(vetoGuardTransactionHash)
        ).toNumber();
        const guardTimeLockPeriod = (await vetoGuard.timelockPeriod()).toNumber();
        const guardExecutionPeriod = (await vetoGuard.executionPeriod()).toNumber();

        const interval = setInterval(() => {
          const now = new Date();
          setCountdown(
            queuedTimestamp + guardTimeLockPeriod + guardExecutionPeriod - now.getTime()
          );
        }, 1000);
        setCountdownInterval(interval);
      }
    }

    getCountdown();

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [
    usulProposal.deadline,
    isActive,
    isTimeLocked,
    isQueued,
    isExecutable,
    countdownInterval,
    proposal.transaction,
    timeLockPeriod,
    vetoGuardContract,
    vetoGuardType,
  ]);

  const tooltipLabel = t(
    isActive
      ? 'votingTooltip'
      : isTimeLocked || isQueued
      ? 'timeLockedTooltip'
      : isExecutable
      ? 'executableTooltip'
      : ''
  );
  const iconName = isActive
    ? 'vote'
    : isTimeLocked || isQueued
    ? 'lock'
    : isExecutable
    ? 'execute'
    : undefined;

  let Icon = null;

  if (iconName) {
    Icon = ICONS_MAP[iconName];
  }

  if (!countdown || !showCountdown) {
    return null;
  }

  // Unfortunately, date-fns don't have anything handy for our countdown display format
  // So, have to do it manually
  const zeroPad = (num: number, places: number) => String(num).padStart(places, '0');
  const hoursLeft = Math.floor(countdown / (1000 * 60 * 60));
  const minutesLeft = Math.floor((countdown / (60 * 1000)) % 60);
  const secondsLeft = Math.floor((countdown / 1000) % 60);

  return (
    <Tooltip
      label={tooltipLabel}
      placement="top"
    >
      <Flex
        className="flex"
        justifyContent="flex-end"
        alignItems="center"
      >
        {Icon && <Icon />}
        <Flex
          px={2}
          gap={1}
        >
          <Text color="chocolate.200">
            {zeroPad(hoursLeft, 2)}:{zeroPad(minutesLeft, 2)}:{zeroPad(secondsLeft, 2)}
          </Text>
        </Flex>
      </Flex>
    </Tooltip>
  );
}

export default ProposalTime;
