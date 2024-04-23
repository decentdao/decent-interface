import { Text, HStack, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import ExampleLabel from './ExampleLabel';
import { InputComponent } from './InputComponent';

export function CustomNonceInput({
  align = 'start',
  nonce,
  onChange,
  disabled,
}: {
  align?: 'start' | 'end';
  nonce: number | undefined;
  onChange: (nonce?: number) => void;
  disabled?: boolean;
}) {
  const {
    node: { safe },
    readOnly: { dao },
  } = useFractal();
  const { t } = useTranslation(['proposal', 'common']);
  const errorMessage =
    nonce !== undefined && safe && nonce < safe.nonce ? t('customNonceError') : undefined;

  if (dao?.isAzorius) return null;

  return (
    <VStack alignItems={align}>
      <InputComponent
          label={t('customNonce', { ns: 'proposal' })}
          helper={t('customNonceTooltip', { ns: 'proposal' })}
          isRequired={false}
          value={nonce?.toString() || ''}
          onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
          disabled={disabled}
          subLabel={
            <HStack>
              <Text>
                {t('example', { ns: 'common' })}: <ExampleLabel bg="neutral-4">14</ExampleLabel>{' '}
              </Text>
            </HStack>
          }
          testId={`custom-nonce`}
        />
      {errorMessage && (
        <Text
          color="alert-red.normal"
          textStyle="body-base"
        >
          {errorMessage}
        </Text>
      )}
    </VStack>
  );
}
