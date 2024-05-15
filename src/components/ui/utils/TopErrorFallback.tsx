import { Button, Center, Flex, Text, Image } from '@chakra-ui/react';
// import * as Sentry from '@sentry/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BASE_ROUTES } from '../../../constants/routes';

// Hook to get and react to the current window width. Using this because the default breakpoints
// are not enough for the design of the error page.
//
// This hook could potentially be moved to a separate file and used in other components during
// responsive design push on pages that require pixel-level logic.
const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowWidth;
};

export function TopErrorFallback() {
  const { t } = useTranslation();
  const windowWidth = useWindowWidth();
  const navigate = useNavigate();

  // These numbers are not arbitrary.
  const largeWidth = 1324;
  const smallWidth = 1060;

  // Default large, medium, and small breakpoints for the error page.
  const isWidthLarge = windowWidth >= largeWidth;
  const isWidthMedium = windowWidth < largeWidth;
  const isWidthSmall = windowWidth < smallWidth;

  const actionButtons = (
    <Flex
      mx={isWidthSmall ? '4rem' : 0}
      flexDir="column"
    >
      <Button
        mr={isWidthSmall ? 0 : '5.84rem'}
        mt="1rem"
        onClick={() => navigate(BASE_ROUTES.landing)}
      >
        {t('goHome')}
      </Button>
      {/* 
        // todo: `Sentry.showReportDialog` doesn't seem to work, not sure what to do, so commenting out till figured out
      <CeleryButtonWithIcon
        mr={isWidthSmall ? 0 : '5.84rem'}
        text="Submit Crash Report"
        mt="1rem"
        onClick={() => {
          Sentry.showReportDialog({
            eventId: '1234',
            title: "It looks like we're having issues",
            subtitle:
              "Decent devs have been notified. If you'd like to help, tell us what happened below.",
            labelName: 'NAME',
            labelEmail: 'EMAIL',
            labelComments: 'WHAT HAPPENED?',
            labelSubmit: 'Submit Crash Report',
            successMessage: 'Thank you for your feedback!',
          });
        }}
      /> */}
    </Flex>
  );

  const useMainImageFullsize = windowWidth > 1170;

  const errorImageMain = (
    <Image
      mt={useMainImageFullsize ? '1.56rem' : 0}
      mb={useMainImageFullsize ? 0 : '4rem'}
      mr="3.19rem"
      width={useMainImageFullsize ? 'auto' : '20rem'}
      p="0"
      fit="fill"
      src="/images/tools.svg"
      alt="Something went wrong"
    />
  );

  const errorImageSmall = (
    <Image
      w="auto"
      my="1.5rem"
      mx="6rem"
      fit="fill"
      src="/images/tools.svg"
      alt="Something went wrong"
    />
  );

  return (
    <Center>
      <Flex
        borderRadius="0.5rem"
        overflow="hidden"
        bg="neutral-2"
        w="auto"
        mt={isWidthLarge ? '12.81rem' : isWidthMedium ? '6rem' : '3.38rem'}
        mb={isWidthSmall ? '3.38rem' : '12.81rem'}
        ml={isWidthSmall ? 0 : '9.44rem'}
        mr={isWidthSmall ? 0 : '9.5rem'}
      >
        {/* ERROR TEXT */}
        <Flex
          mt={isWidthLarge ? '5.37rem' : isWidthMedium ? '3.37rem' : 0}
          mb={isWidthSmall ? '5.37rem' : isWidthMedium ? '3rem' : 0}
          ml={isWidthSmall ? 0 : '3.06rem'}
          mr={isWidthSmall ? 0 : '7.16rem'}
          p={isWidthSmall ? '1.25rem' : 0}
          flexDir="column"
          gap="0.5rem"
        >
          <Text textStyle="display-4xl">{t('errorSentryFallbackTitle')}</Text>
          <Text textStyle="display-xl">{t('errorSentryFallbackMessage')}</Text>

          {isWidthSmall && errorImageSmall}

          {actionButtons}
        </Flex>

        {/* RIGHT IMAGE */}
        {!isWidthSmall && errorImageMain}
      </Flex>
    </Center>
  );
}
