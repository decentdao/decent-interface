import * as amplitude from '@amplitude/analytics-browser';
import { Box } from '@chakra-ui/react';
import { Activities } from '../../../components/pages/DaoDashboard/Activities';
import { ERCO20Claim } from '../../../components/pages/DaoDashboard/ERC20Claim';
import { DaoInfoHeader } from '../../../components/pages/DaoDashboard/Info/DaoInfoHeader';
import { CONTENT_MAXW } from '../../../constants/common';
import { analyticsEvents } from '../../../insights/analyticsEvents';

export default function DaoDashboardPage() {
  amplitude.track(analyticsEvents.DaoDashboardPageOpened);
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
