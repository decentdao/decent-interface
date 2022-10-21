import ContentBoxTitle from './ContentBoxTitle';
import { Box } from '@chakra-ui/react';

function ContentBox({
  title,
  isLightBackground,
  children,
}: {
  title?: string;
  isLightBackground?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box
      rounded="lg"
      p="1rem 1.5rem"
      my="4"
      shadow="dark-lg"
      bg={isLightBackground ? 'black.500' : 'black.600'}
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
