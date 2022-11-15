import { useNavigate } from 'react-router-dom';
import { Option } from '../../../components/menus/OptionMenu';
import { DAOInfoCard } from '../../../components/ui/cards/DAOInfoCard';
import { useFractal } from '../../../providers/fractal/hooks/useFractal';

export function InfoDAO() {
  const {
    gnosis: { safe },
  } = useFractal();

  // @todo replace mocked values
  const MOCK_IS_SUB_DAO = false;
  const navigate = useNavigate();

  if (!safe.address) {
    // @todo replace with a loader
    return <div />;
  }

  const options: Option[] = [
    { optionKey: 'optionCreateSubDAO', function: () => {} }, // TODO subDAO creation hook
    { optionKey: 'optionInitiateFreeze', function: () => navigate(safe.address!) }, // TODO freeze hook (if parent voting holder)
  ];

  return (
    <DAOInfoCard
      safeAddress={safe.address}
      options={options}
    />
  );
}
