import { Box, Divider, Flex, Spacer, Text } from '@chakra-ui/react';
import { Button } from '@decent-org/fractal-ui';
import { ReactNode } from 'react';

interface IPageHeader {
  title: string;
  titleTestId: string;
  buttonVariant?: 'text';
  buttonText?: string;
  buttonClick?: () => void;
  buttonTestId?: string;
  children?: ReactNode;
}
/**
 * A component which displays a page title and an optional action button.
 * Intended to be used as the main title for a page.
 */
function PageHeader({
  title,
  titleTestId,
  buttonVariant,
  buttonText,
  buttonClick,
  buttonTestId,
  children,
}: IPageHeader) {
  return (
    <Box
      marginTop="3rem"
      marginBottom="2rem"
    >
      <Flex
        w="full"
        align="center"
      >
        <Text
          data-testid={titleTestId}
          textStyle="text-2xl-mono-regular"
          color="grayscale.100"
        >
          {title}
        </Text>
        <Spacer />
        {buttonText && (
          <Button
            onClick={buttonClick}
            data-testid={buttonTestId}
            size="base"
            variant={buttonVariant}
          >
            {buttonText}
          </Button>
        )}
        {children}
      </Flex>
      <Divider
        marginTop="1rem"
        borderColor="chocolate.400"
      />
    </Box>
  );
}
export default PageHeader;
