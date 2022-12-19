import { VEllipsis } from '@decent-org/fractal-ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useWithinFreezePeriod from '../../../../hooks/utils/useWithinFreezePeriod';
import { useFractal } from '../../../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../../../routes/constants';
import { OptionMenu } from '../OptionMenu';

export function ManageDAOMenu({ safeAddress }: { safeAddress: string }) {
  const navigate = useNavigate();
  const {
    gnosis: { guardContracts, freezeData },
  } = useFractal();
  const withinFreezeProposalPeriod = useWithinFreezePeriod(freezeData);

  const options = useMemo(() => {
    const createSubDAOOption = {
      optionKey: 'optionCreateSubDAO',
      onClick: () => navigate(DAO_ROUTES.newSubDao.relative(safeAddress)),
    };
    console.log(freezeData);
    if (
      freezeData &&
      !freezeData.isFrozen &&
      withinFreezeProposalPeriod &&
      !withinFreezeProposalPeriod.withinPeriod &&
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
  }, [safeAddress, navigate, guardContracts, freezeData, withinFreezeProposalPeriod]);

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
