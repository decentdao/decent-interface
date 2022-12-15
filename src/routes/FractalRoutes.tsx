import { useEffect } from 'react';
import { Route, Routes, useMatch } from 'react-router-dom';
import DaoCreate from '../pages/DaoCreate';
import Home from '../pages/Home';
import { GnosisAction, TreasuryAction } from '../providers/Fractal/constants';
import { GovernanceAction } from '../providers/Fractal/governance/actions';
import { useFractal } from '../providers/Fractal/hooks/useFractal';
import DAORoutes from './DAORoutes';
import { BASE_ROUTES, DAO_ROUTES } from './constants';

function FractalRoutes() {
  const {
    dispatches: { gnosisDispatch, governanceDispatch, treasuryDispatch },
  } = useFractal();

  const isHome = useMatch(BASE_ROUTES.landing);
  const isCreate = useMatch(BASE_ROUTES.create);

  useEffect(() => {
    // Resets Fractal state when not viewing DAO
    if (!!isHome || !!isCreate) {
      gnosisDispatch({ type: GnosisAction.RESET });
      treasuryDispatch({ type: TreasuryAction.RESET });
      governanceDispatch({ type: GovernanceAction.RESET });
    }
  }, [gnosisDispatch, treasuryDispatch, governanceDispatch, isHome, isCreate]);

  return (
    <Routes>
      <Route
        index
        element={<Home />}
      />
      <Route
        path={BASE_ROUTES.create}
        element={<DaoCreate />}
      />
      <Route
        path={DAO_ROUTES.daos.path}
        element={<DAORoutes />}
      />
    </Routes>
  );
}

export default FractalRoutes;
