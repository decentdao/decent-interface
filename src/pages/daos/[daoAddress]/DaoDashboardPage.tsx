import { Box } from '@chakra-ui/react';
import { Activities } from '../../../components/pages/DaoDashboard/Activities';
import { ERCO20Claim } from '../../../components/pages/DaoDashboard/ERC20Claim';
import { DaoInfoHeader } from '../../../components/pages/DaoDashboard/Info/DaoInfoHeader';
import { CONTENT_MAXW } from '../../../constants/common';

export default function DaoDashboardPage() {
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
