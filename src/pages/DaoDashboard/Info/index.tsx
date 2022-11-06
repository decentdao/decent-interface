import { Flex } from '@chakra-ui/react';
import { InfoBox } from '../../../components/ui/containers/InfoBox';
import { InfoDAO } from './InfoDAO';
import { InfoGovernance } from './InfoGovernance';
import { InfoProposals } from './InfoProposals';
import { InfoTreasury } from './InfoTreasury';

export function Info() {
  return (
    <Flex
      flexDirection="column"
      minH="10.5rem"
    >
      <Flex
        flexWrap="wrap"
        gap="1.5rem"
        justifyContent="center"
        mb="1rem"
      >
        <InfoBox minWidth={{ sm: '90%', xl: '41.5rem' }}>
          <InfoDAO />
        </InfoBox>
        <InfoBox minWidth={{ sm: '90%', lg: '44%', xl: '14.4375rem' }}>
          <InfoGovernance />
        </InfoBox>
        <InfoBox minWidth={{ sm: '43%', lg: '44%', xl: '10.3125rem' }}>
          <InfoProposals />
        </InfoBox>
        <InfoBox minWidth={{ sm: '43%', lg: '43%', xl: '87%', '2xl': '9.25rem' }}>
          <InfoTreasury />
        </InfoBox>
      </Flex>
    </Flex>
  );
}
