import { Box, Flex } from '@chakra-ui/react';
import { DAOInfoCard } from '../../ui/cards/DAOInfoCard';
import { InfoBox } from '../../ui/containers/InfoBox';
import { InfoGovernance } from './InfoGovernance';
import { InfoProposals } from './InfoProposals';
import { InfoTreasury } from './InfoTreasury';
import { ParentLink } from './ParentLink';

export function DaoInfoHeader() {
  return (
    <Flex
      flexDirection="column"
      minH="10.5rem"
    >
      <ParentLink />
      <Flex
        flexWrap="wrap"
        justifyContent="space-between"
        mb="2rem"
        gap={{ base: '1rem', md: '0.75rem' }}
      >
        <Box width={{ base: '100%', lg: '30%', xl: '35%' }}>
          <InfoBox>
            <DAOInfoCard />
          </InfoBox>
        </Box>

        <>
          <Box width={{ base: '100%', md: '32%', lg: '24%', xl: '20%' }}>
            <InfoBox>
              <InfoGovernance />
            </InfoBox>
          </Box>

          <Box width={{ base: '100%', md: '32%', lg: '20%' }}>
            <InfoBox>
              <InfoProposals />
            </InfoBox>
          </Box>

          <Box width={{ base: '100%', md: '32%', lg: '20%' }}>
            <InfoBox>
              <InfoTreasury />
            </InfoBox>
          </Box>
        </>
      </Flex>
    </Flex>
  );
}
