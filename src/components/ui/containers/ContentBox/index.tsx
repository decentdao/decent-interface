import { Box, BoxProps } from '@chakra-ui/react';
import ContentBoxTitle from './ContentBoxTitle';

interface ContentBoxProps {
  title?: string;
  children: React.ReactNode;
  containerBoxProps?: BoxProps;
}

function ContentBox({ title, children, containerBoxProps }: ContentBoxProps) {
  return (
    <Box
      rounded="lg"
      p="1rem 1.5rem"
      my="4"
      bg="black.900"
      {...containerBoxProps}
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
