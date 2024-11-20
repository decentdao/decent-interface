import {
  Alert,
  Box,
  Flex,
  FormControl,
  InputGroup,
  InputRightElement,
  Switch,
  Text,
} from '@chakra-ui/react';
import { WarningCircle } from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';
import { FractalModuleType, ICreationStepProps, VotingStrategyType } from '../../../types';
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
    safe,
    nodeHierarchy: { parentAddress },
    fractalModules,
  } = useDaoInfoStore();

  const fractalModule = useMemo(
    () => fractalModules.find(_module => _module.moduleType === FractalModuleType.FRACTAL),
    [fractalModules],
  );

  const [showCustomNonce, setShowCustomNonce] = useState<boolean>();
  const { t } = useTranslation(['daoCreate', 'common']);
  const minutes = t('minutes', { ns: 'common' });

  const handleNonceChange = useCallback(
    (nonce?: string) => {
      setFieldValue('multisig.customNonce', Number(nonce));
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
          {/* QUORUM */}
          {values.azorius.votingStrategyType === VotingStrategyType.LINEAR_ERC20 ? (
            <LabelComponent
              label={t('quorum', { ns: 'common' })}
              helper={t('helperQuorumERC20')}
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
              helper={t('helperQuorumERC721')}
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

          {/* VOTING PERIOD */}
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

          {/* TIMELOCK PERIOD */}
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
          </LabelComponent>

          {/* EXECUTION PERIOD */}
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
          </LabelComponent>

          <Alert
            status="info"
            gap={4}
          >
            <Box
              width="1.5rem"
              height="1.5rem"
            >
              <WarningCircle size="24" />
            </Box>
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
      {!!parentAddress && (
        <Box
          padding="1.5rem"
          bg="neutral-2"
          borderRadius="0.25rem"
          mt="1.5rem"
          mb={showCustomNonce ? '1.5rem' : 0}
        >
          <FormControl
            gap="0.5rem"
            width="100%"
            justifyContent="space-between"
            display="flex"
            isDisabled={!!fractalModule}
          >
            <Text>{t('attachFractalModuleLabel')}</Text>
            <Switch
              size="md"
              variant="secondary"
              onChange={() =>
                setFieldValue('freeze.attachFractalModule', !values.freeze.attachFractalModule)
              }
              isChecked={!!fractalModule || values.freeze.attachFractalModule}
              isDisabled={!!fractalModule}
            />
          </FormControl>
          <Text
            color="neutral-7"
            width="50%"
          >
            {t(
              fractalModule ? 'fractalModuleAttachedDescription' : 'attachFractalModuleDescription',
            )}
          </Text>
        </Box>
      )}
      {showCustomNonce && (
        <Box
          padding="1.5rem"
          bg="neutral-2"
          borderRadius="0.25rem"
          my="1.5rem"
        >
          <CustomNonceInput
            nonce={values.multisig.customNonce}
            onChange={handleNonceChange}
            renderTrimmed={false}
          />
        </Box>
      )}
      <StepButtons
        {...props}
        isEdit={mode === DAOCreateMode.EDIT}
      />
    </>
  );
}
