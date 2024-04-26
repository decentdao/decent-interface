import { Box, Hide, Text, Flex } from '@chakra-ui/react';
import { Icon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface INavigationLink {
  href: string;
  labelKey: string;
  testId: string;
  NavigationIcon: Icon;
  target?: string;
  rel?: string;
  closeDrawer?: () => void;
}

export function NavigationLink({
  labelKey,
  testId,
  NavigationIcon,
  closeDrawer,
  href,
  ...rest
}: INavigationLink) {
  const { t } = useTranslation('navigation');

  return (
    <Box py={3}>
      <Link
        data-testid={testId}
        aria-label={t(labelKey)}
        to={href}
        {...rest}
        onClick={closeDrawer}
      >
        <Flex>
          <Box w={6}>{<NavigationIcon size={24} />}</Box>
          <Box
            mx={3}
            whiteSpace="nowrap"
          >
            {t(labelKey)}
          </Box>
          <Hide above="md">
            <Text textStyle="text-md-mono-medium">{t(labelKey)}</Text>
          </Hide>
        </Flex>
      </Link>
    </Box>
  );
}
