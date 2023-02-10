import { Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

function ContentBoxTitle({ children }: { children: ReactNode }) {
  return (
    <Text
      textStyle="text-lg-mono-medium"
      color="grayscale.100"
    >
      {children}
    </Text>
  );
}

export default ContentBoxTitle;
