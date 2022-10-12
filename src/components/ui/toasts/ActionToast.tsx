import { Button, Flex, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

// @todo this component should be made and exported from design systems
interface IActionToast {
  isVisible?: boolean;
  titleTranslationKey: string;
  buttonTranslationKey: string;
  buttonOnClick: () => void;
}

export function ActionToast({
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

    const toastId = toast(
      <Flex
        direction="column"
        alignItems="center"
      >
        <Text>{t(titleTranslationKey)}</Text>
        <Button
          color="gold.500"
          textStyle="textStyles.text-md-mono-"
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
      }
    );

    return () => {
      toast.dismiss(toastId);
    };
  }, [buttonOnClick, buttonTranslationKey, isVisible, t, titleTranslationKey]);

  return null;
}
