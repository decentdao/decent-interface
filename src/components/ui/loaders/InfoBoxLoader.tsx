import { Flex } from '@chakra-ui/react';
import { InfoBox } from '../containers/InfoBox';
import { BarLoader } from './BarLoader';

export function InfoBoxLoader() {
  return (
    <InfoBox minHeight="5rem">
      <Flex
        alignItems="center"
        justifyContent="center"
        height="5rem"
      >
        <BarLoader />
      </Flex>
    </InfoBox>
  );
}
