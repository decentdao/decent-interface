import { Alert, Flex, InputGroup, InputRightElement, Text } from '@chakra-ui/react';
import { WarningCircle } from '@phosphor-icons/react';
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/App/AppProvider';
import { ICreationStepProps, VotingStrategyType } from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigIntInput } from '../../ui/forms/BigIntInput';
import { CustomNonceInput } from '../../ui/forms/CustomNonceInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';
import useStepRedirect from '../hooks/useStepRedirect';
import { DAOCreateMode } from './EstablishEssentials';

export function AzoriusGovernance(props: ICreationStepProps) {
  const { values, setFieldValue, isSubmitting, transactionPending, isSubDAO, mode } = props;
  const {
    node: { safe },
  } = useFractal();

  const [showCustomNonce, setShowCustomNonce] = useState<boolean>();
  const { t } = useTranslation(['daoCreate', 'common']);
  const minutes = t('minutes', { ns: 'common' });

  const handleNonceChange = useCallback(
    (nonce?: number) => {
      setFieldValue('multisig.customNonce', nonce);
    },
    [setFieldValue],
  );

  useEffect(() => {
    if (showCustomNonce === undefined && safe && mode === DAOCreateMode.EDIT) {
      setFieldValue('multisig.customNonce', safe.nextNonce);
      setShowCustomNonce(true);
    }
  }, [setFieldValue, safe, showCustomNonce, mode]);

  useStepRedirect({ values });

  return (
    <>
      <StepWrapper
        mode={mode}
        titleKey="titleGovConfig"
        isSubDAO={isSubDAO}
        isFormSubmitting={!!isSubmitting || transactionPending}
      >
        <Flex
          flexDirection="column"
          gap={8}
        >
          <ContentBoxTitle>{t('titleProposalSettings', { ns: 'daoCreate' })}</ContentBoxTitle>
          <LabelComponent
            label={t('labelVotingPeriod')}
            helper={t('helperVotingPeriod')}
            isRequired
          >
            <InputGroup>
              <BigIntInput
                value={values.azorius.votingPeriod.bigintValue}
                onChange={valuePair => setFieldValue('azorius.votingPeriod', valuePair)}
                decimalPlaces={0}
                min="1"
                data-testid="govConfig-votingPeriod"
              />
              <InputRightElement mr="4">{minutes}</InputRightElement>
            </InputGroup>
            <Text
              textStyle="helper-text-base"
              color="neutral-7"
              mt="0.5rem"
            >
              {t('exampleVotingPeriod')}
            </Text>
          </LabelComponent>
          {values.azorius.votingStrategyType === VotingStrategyType.LINEAR_ERC20 ? (
            <LabelComponent
              label={t('quorum', { ns: 'common' })}
              helper={t('helperQuorum')}
              isRequired
            >
              <InputGroup>
                <BigIntInput
                  value={values.azorius.quorumPercentage.bigintValue}
                  onChange={valuePair => setFieldValue('azorius.quorumPercentage', valuePair)}
                  max="100"
                  decimalPlaces={0}
                  data-testid="govConfig-quorumPercentage"
                />
                <InputRightElement>%</InputRightElement>
              </InputGroup>
            </LabelComponent>
          ) : (
            <LabelComponent
              label={t('quorum', { ns: 'common' })}
              helper={t('helperQuorumThreshold')}
              isRequired
            >
              <BigIntInput
                value={values.erc721Token.quorumThreshold.bigintValue}
                onChange={valuePair => setFieldValue('erc721Token.quorumThreshold', valuePair)}
                decimalPlaces={0}
                min="1"
                data-testid="govConfig-quorumThreshold"
              />
            </LabelComponent>
          )}
          <LabelComponent
            label={t('labelTimelockPeriod')}
            helper={t('helperTimelockPeriod')}
            isRequired
          >
            <InputGroup>
              <BigIntInput
                value={values.azorius.timelock.bigintValue}
                onChange={valuePair => setFieldValue('azorius.timelock', valuePair)}
                decimalPlaces={0}
                data-testid="govConfig-timelock"
              />
              <InputRightElement mr="4">{minutes}</InputRightElement>
            </InputGroup>
            <Text
              textStyle="helper-text-base"
              color="neutral-7"
              mt="0.5rem"
            >
              {t('exampleTimelockPeriod')}
            </Text>
          </LabelComponent>
          <LabelComponent
            label={t('labelExecutionPeriod')}
            helper={t('helperExecutionPeriod')}
            isRequired
          >
            <InputGroup>
              <BigIntInput
                value={values.azorius.executionPeriod.bigintValue}
                onChange={valuePair => setFieldValue('azorius.executionPeriod', valuePair)}
                decimalPlaces={0}
                min="1"
                data-testid="govModule-executionDetails"
              />
              <InputRightElement mr="4">{minutes}</InputRightElement>
            </InputGroup>
            <Text
              textStyle="helper-text-base"
              color="neutral-7"
              mt="0.5rem"
            >
              {t('exampleExecutionPeriod')}
            </Text>
          </LabelComponent>
          {showCustomNonce && (
            <CustomNonceInput
              nonce={values.multisig.customNonce}
              onChange={handleNonceChange}
              align="end"
            />
          )}
          <Alert status="info">
            <WarningCircle size="24" />
            <Text
              textStyle="body-base-strong"
              whiteSpace="pre-wrap"
              ml="1rem"
            >
              {t('governanceDescription')}
            </Text>
          </Alert>
        </Flex>
      </StepWrapper>
      <StepButtons
        {...props}
        isEdit={mode === DAOCreateMode.EDIT}
      />
    </>
  );
}
