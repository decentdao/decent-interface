import { Box } from '@chakra-ui/react';
import ContentBoxTitle from './ContentBoxTitle';

interface ContentBoxProps {
  title?: string;
  children: React.ReactNode;
  height?: string;
  bg?: string;
}

function ContentBox({ title, height, children, bg = 'black.900' }: ContentBoxProps) {
  return (
    <Box
      rounded="lg"
      p="1rem 1.5rem"
      my="4"
      bg={bg}
      height={height}
    >
      {title && <ContentBoxTitle>{title}</ContentBoxTitle>}
      <Box
        px="2"
        py="4"
      >
        {children}
      </Box>
    </Box>
  );
}

export default ContentBox;
