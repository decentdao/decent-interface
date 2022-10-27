import { Box, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { InfoDAO } from './InfoDAO';
import { InfoGovernance } from './InfoGovernance';
import { InfoProposals } from './InfoProposals';
import { InfoTreasury } from './InfoTreasury';

function InfoCard({
  minWidth,
  children,
}: {
  minWidth: { [key: string]: string };
  children?: ReactNode;
}) {
  return (
    <Box
      minWidth={minWidth}
      h="full"
      bg="black.900-semi-transparent"
      p="1rem"
      borderRadius="0.5rem"
    >
      {children}
    </Box>
  );
}

export function DaoDashboard() {
  return (
    <Box py="1.5rem">
      {/* TOP DAO INFORMATION */}
      <Flex
        flexWrap="wrap"
        gap="1.5rem"
        h="10.5rem"
        justifyContent="center"
      >
        <InfoCard minWidth={{ sm: '90%', xl: '41.5rem' }}>
          <InfoDAO />
        </InfoCard>
        <InfoCard minWidth={{ sm: '90%', lg: '44%', xl: '14.4375rem' }}>
          <InfoGovernance />
        </InfoCard>
        <InfoCard minWidth={{ sm: '43%', lg: '44%', xl: '10.3125rem' }}>
          <InfoProposals />
        </InfoCard>
        <InfoCard minWidth={{ sm: '43%', xl: '9.25rem' }}>
          <InfoTreasury />
        </InfoCard>
      </Flex>
      {/* FILTERS */}
      {/* ACTIVITY FEED */}
    </Box>
  );
}
