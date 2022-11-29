import { Box } from '@chakra-ui/react';
import ContentBoxTitle from './ContentBoxTitle';

interface ContentBoxProps {
  title?: string;
  children: React.ReactNode;
  bg?: string;
}

function ContentBox({ title, children, bg = 'black.900' }: ContentBoxProps) {
  return (
    <Box
      rounded="lg"
      p="1rem"
      my="2"
      bg={bg}
    >
      {title && <ContentBoxTitle>{title}</ContentBoxTitle>}
      <Box pb="4">{children}</Box>
    </Box>
  );
}

export default ContentBox;
