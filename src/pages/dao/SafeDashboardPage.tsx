import * as amplitude from '@amplitude/analytics-browser';
import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Activities } from '../../components/DaoDashboard/Activities';
import { ERCO20Claim } from '../../components/DaoDashboard/ERC20Claim';
import { DaoInfoHeader } from '../../components/DaoDashboard/Info/DaoInfoHeader';
import { CONTENT_MAXW } from '../../constants/common';
import { analyticsEvents } from '../../insights/analyticsEvents';

export function SafeDashboardPage() {
  useEffect(() => {
    amplitude.track(analyticsEvents.DaoDashboardPageOpened);
  }, []);
  return (
    <>
      <Box
        mt={12}
        maxW={CONTENT_MAXW}
      >
        <DaoInfoHeader />
        <ERCO20Claim />
        <Activities />
      </Box>
    </>
  );
}
