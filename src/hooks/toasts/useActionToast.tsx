import { Flex, Text, Button } from '@chakra-ui/react';
import { Fragment, useEffect } from 'react';
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

export function useActionToast({
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
      toast.dismiss(toastId);
      return;
    }
    toast(
      <Fragment>
        <Flex
          direction="column"
          alignItems="center"
          data-testid={testId}
        >
          <Text
            textStyle="textStyles.text-sm-mono-regular"
            color="alert-red.light"
          >
            {t(titleTranslationKey)}
          </Text>
          <Button
            color="gold.500"
            my="1"
            textStyle="textStyles.text-md-mono-bold"
            variant="text"
            onClick={buttonOnClick}
          >
            {t(buttonTranslationKey)}
          </Button>
        </Flex>
      </Fragment>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        progress: 1,
        toastId,
      }
    );
  }, [buttonOnClick, buttonTranslationKey, isVisible, t, testId, titleTranslationKey, toastId]);
}
