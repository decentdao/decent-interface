import { Button, Flex, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

// @todo this component should be made and exported from design systems
interface IActionToast {
  testId: string;
  toastId: string;
  isVisible?: boolean;
  titleTranslationKey: string;
  buttonTranslationKey: string;
  buttonOnClick: () => void;
}

export function ActionToast({
  testId,
  toastId,
  isVisible,
  titleTranslationKey,
  buttonTranslationKey,
  buttonOnClick,
}: IActionToast) {
  const { t } = useTranslation();
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    toast(
      <Flex
        direction="column"
        alignItems="center"
      >
        <Text
          textStyle="textStyles.text-sm-mono-regular"
          color="alert-red.light"
        >
          {t(titleTranslationKey)}
        </Text>
        <Button
          data-testId={testId}
          color="gold.500"
          my="1"
          textStyle="textStyles.text-md-mono-bold"
          variant="unstyled"
          onClick={buttonOnClick}
        >
          {t(buttonTranslationKey)}
        </Button>
      </Flex>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        progress: 1,
        toastId,
      }
    );

    return () => {
      toast.dismiss(toastId);
    };
  }, [buttonOnClick, buttonTranslationKey, isVisible, t, testId, titleTranslationKey, toastId]);

  return null;
}
