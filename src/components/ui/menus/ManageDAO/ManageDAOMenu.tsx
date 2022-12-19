import { VEllipsis } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isWithinFreezePeriod,
  isWithinFreezeProposalPeriod,
} from '../../../../helpers/freezePeriodHelpers';
import useBlockTimestamp from '../../../../hooks/utils/useBlockTimestamp';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../../../routes/constants';
import { OptionMenu } from '../OptionMenu';

export function ManageDAOMenu({ safeAddress }: { safeAddress: string }) {
  const navigate = useNavigate();
  const {
    gnosis: { guardContracts, freezeData },
  } = useFractal();
  const currentTime = BigNumber.from(useBlockTimestamp());

  const options = useMemo(() => {
    const createSubDAOOption = {
      optionKey: 'optionCreateSubDAO',
      onClick: () => navigate(DAO_ROUTES.newSubDao.relative(safeAddress)),
    };
    if (
      freezeData &&
      !isWithinFreezeProposalPeriod(freezeData, currentTime) &&
      !isWithinFreezePeriod(freezeData, currentTime) &&
      freezeData.userHasVotes
    ) {
      const freezeOption = {
        optionKey: 'optionInitiateFreeze',
        onClick: () => guardContracts.vetoVotingContract?.castFreezeVote(),
      };
      return [createSubDAOOption, freezeOption];
    } else {
      return [createSubDAOOption];
    }
  }, [safeAddress, navigate, guardContracts, freezeData, currentTime]);

  return (
    <OptionMenu
      trigger={
        <VEllipsis
          boxSize="1.5rem"
          mt="0.25rem"
        />
      }
      titleKey="titleManageDAO"
      options={options}
      namespace="menu"
    />
  );
}
