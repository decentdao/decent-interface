import { Button, ButtonProps, Text } from '@chakra-ui/react';

type CeleryTextLinkProps = {
  text: string;
} & ButtonProps;

// @todo Similar styling is used in PR #1980, consider replacing that PR's implementation with this component
export function CeleryTextLink({ onClick, text }: CeleryTextLinkProps) {
  return (
    <Button
      variant="text"
      color="celery-0"
      _hover={{ textDecoration: 'underline' }}
      _active={{ color: 'celery--2' }}
      onClick={onClick}
    >
      <Text
        textOverflow="ellipsis"
        overflow="hidden"
      >
        {text}
      </Text>
    </Button>
  );
}
