import { Text } from '@chakra-ui/react';
import { ReactNode } from 'react';

function ContentBoxTitle({ children }: { children: ReactNode }) {
  return (
    <Text
      textStyle="heading-small"
      color="white-0"
    >
      {children}
    </Text>
  );
}

export default ContentBoxTitle;
