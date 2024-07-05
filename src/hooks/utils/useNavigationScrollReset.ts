import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '../../utils/ui';

export default function useNavigationScrollReset() {
  const { pathname } = useLocation();
  useEffect(() => {
    scrollToTop(0, 'instant');
  }, [pathname]);
}
