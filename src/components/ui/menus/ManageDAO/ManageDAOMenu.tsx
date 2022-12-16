import { VEllipsis } from '@decent-org/fractal-ui';
import { VetoERC20Voting, VetoMultisigVoting } from '@fractal-framework/fractal-contracts';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCastFreezeVote from '../../../../hooks/DAO/useCastFreezeVote';
import { DAO_ROUTES } from '../../../../routes/constants';
import { OptionMenu } from '../OptionMenu';

export function ManageDAOMenu({
  safeAddress,
  vetoVotingContract,
}: {
  safeAddress: string;
  vetoVotingContract: VetoERC20Voting | VetoMultisigVoting;
}) {
  const navigate = useNavigate();
  const [pending, setPending] = useState<boolean>(false);
  const castFreezeVote = useCastFreezeVote({
    vetoVotingContract: vetoVotingContract,
    setPending: setPending,
  });

  const options = useMemo(
    () => [
      {
        optionKey: 'optionCreateSubDAO',
        onClick: () => navigate(DAO_ROUTES.newSubDao.relative(safeAddress)),
      },
      { optionKey: 'optionInitiateFreeze', onClick: castFreezeVote }, // TODO freeze hook (if parent voting holder)
    ],
    [safeAddress, navigate, castFreezeVote]
  );

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
