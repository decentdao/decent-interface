import { VEllipsis } from '@decent-org/fractal-ui';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DAO_ROUTES } from '../../../routes/constants';
import { OptionMenu } from '../OptionMenu';

export function ManageDAOMenu({ safeAddress }: { safeAddress: string }) {
  const navigate = useNavigate();

  const options = useMemo(
    () => [
      {
        optionKey: 'optionCreateSubDAO',
        onClick: () => navigate(DAO_ROUTES.newSubDao.relative(safeAddress)),
      },
      { optionKey: 'optionInitiateFreeze', onClick: () => {} }, // TODO freeze hook (if parent voting holder)
    ],
    [safeAddress, navigate]
  );

  return (
    <OptionMenu
      trigger={
        <VEllipsis
          boxSize="1.5rem"
          mt="0.25rem"
        />
      }
      titleKey={'titleManageDAO'}
      options={options}
      namespace={'menu'}
    />
  );
}
