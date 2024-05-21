import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import useDAOController from '../hooks/DAO/useDAOController';
import { useFractal } from '../providers/App/AppProvider';
import LoadingProblem from './LoadingProblem';

export default function DAOController() {
  const { errorLoading, wrongNetwork, invalidQuery } = useDAOController();
  const {
    node: { daoName },
  } = useFractal();

  useEffect(() => {
    if (daoName) {
      document.title = `${import.meta.env.VITE_APP_NAME} | ${daoName}`;
    }

    return () => {
      document.title = import.meta.env.VITE_APP_NAME;
    };
  }, [daoName]);

  let display;

  // the order of the if blocks of these next three error states matters
  if (invalidQuery) {
    display = <LoadingProblem type="badQueryParam" />;
  } else if (wrongNetwork) {
    display = <LoadingProblem type="wrongNetwork" />;
  } else if (errorLoading) {
    display = <LoadingProblem type="invalidSafe" />;
  } else {
    display = <Outlet />;
  }

  return display;
}
