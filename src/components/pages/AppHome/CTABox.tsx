import { Box, Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

export default function CTABox({
  Icon,
  titleKey,
  descKey,
  titleColor = 'white-0',
  descColor = 'neutral-7',
  bg = 'neutral-3',
  to,
  target,
  pr,
  iconContainerJustify,
}: {
  Icon: ReactNode;
  titleKey: string;
  descKey: string;
  titleColor?: string;
  descColor?: string;
  bg?: string;
  to: string;
  target?: string;
  pr?: string | number;
  iconContainerJustify?: string;
}) {
  const { t } = useTranslation('home');
  return (
    <Flex
      gap="3rem"
      px="1.5rem"
      w={{ base: '100%', lg: 'calc(50% - 0.75rem)' }}
      h="10rem"
      bg={bg}
      alignItems="center"
      borderRadius={8}
      as={Link}
      pr={pr}
      to={to}
      target={target}
    >
      <Box width="50%">
        <Text
          textStyle="display-2xl"
          color={titleColor}
        >
          {t(titleKey)}
        </Text>
        <Text color={descColor}>{t(descKey)}</Text>
      </Box>
      <Flex
        width="50%"
        justifyContent={iconContainerJustify}
      >
        {Icon}
      </Flex>
    </Flex>
  );
}
