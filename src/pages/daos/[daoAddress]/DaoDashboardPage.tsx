import { Box } from '@chakra-ui/react';
import { Activities } from '../../../components/pages/DaoDashboard/Activities';
import { ERCO20Claim } from '../../../components/pages/DaoDashboard/ERC20Claim';
import { DaoInfoHeader } from '../../../components/pages/DaoDashboard/Info/DaoInfoHeader';
import { DaoSpecificMetadataHeader } from '../../../components/pages/DaoDashboard/Info/DaoSpecificMetadataHeader';
import { CONTENT_MAXW } from '../../../constants/common';
import useDAOMetadata from '../../../hooks/DAO/useDAOMetadata';

export default function DaoDashboardPage() {
  const daoMetadata = useDAOMetadata();

  return (
    <>
      {daoMetadata && <DaoSpecificMetadataHeader metadata={daoMetadata} />}
      <Box
        mt={!!daoMetadata ? 40 : 12}
        maxW={CONTENT_MAXW}
      >
        <DaoInfoHeader />
        <ERCO20Claim />
        <Activities />
      </Box>
    </>
  );
}
