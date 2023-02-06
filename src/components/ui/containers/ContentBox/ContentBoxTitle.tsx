import { Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

function ContentBoxTitle({ children }: { children: ReactNode }) {
  return (
    <Text
      textStyle="text-base-sans-semibold"
      color="grayscale.500"
    >
      {children}
    </Text>
  );
}

export default ContentBoxTitle;
