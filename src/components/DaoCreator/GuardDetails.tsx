import {
  Box,
  Text,
  NumberInput,
  NumberInputField,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../hooks/utils/useFormHelpers';
import ContentBanner from '../ui/ContentBanner';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import InputBox from '../ui/forms/InputBox';
import { useCreator } from './provider/hooks/useCreator';
import { CreatorProviderActions } from './provider/types';

function GuardDetails() {
  const {
    state: { vetoGuard, governance },
    dispatch,
  } = useCreator();

  const { restrictChars } = useFormHelpers();

  const fieldUpdate = (value: any, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_GUARD_CONFIG,
      payload: {
        [field]: value,
      },
    });
  };
  const onExecutionDetailsChange = (executionDetails: string) => {
    const newExecution = BigNumber.from(executionDetails || 0);
    fieldUpdate(newExecution, 'executionDetails');
  };
  const onVetoVotesThresholdChange = (vetoVotesThreshold: string) => {
    const newVetoVotesThreshold = BigNumber.from(vetoVotesThreshold || 0);
    fieldUpdate(newVetoVotesThreshold, 'vetoVotesThreshold');
  };
  const onFreezeVotesThresholdChange = (freezeVotesThreshold: string) => {
    const newFreezeVotesThreshold = BigNumber.from(freezeVotesThreshold || 0);
    fieldUpdate(newFreezeVotesThreshold, 'freezeVotesThreshold');
  };

  const onFreezeProposalBlockDurationChange = (freezeProposalBlockDuration: string) => {
    const newFreezeProposalBlockDuration = BigNumber.from(freezeProposalBlockDuration || 0);
    fieldUpdate(newFreezeProposalBlockDuration, 'freezeProposalBlockDuration');
  };

  const onFreezeBlockDurationChange = (freezeBlockDuration: string) => {
    const newFreezeBlockDuration = BigNumber.from(freezeBlockDuration || 0);
    fieldUpdate(newFreezeBlockDuration, 'freezeBlockDuration');
  };

  const { t } = useTranslation(['common', 'daoCreate']);
  const votes = t('votes');
  const blocks = t('blocks');
  return (
    <Box>
      <ContentBox>
        <ContentBoxTitle>Veto Guard Settings</ContentBoxTitle>
        <InputBox>
          <LabelWrapper
            label={ governance === 'safe' ? t('labelExecutionDelayBlocks', { ns: 'daoCreate' }) : t('labelExecutionPeriod', { ns: 'daoCreate' }) }
            subLabel={governance === 'safe' ? t('helperExecutionDelayBlocks', { ns: 'daoCreate' }) : t('helperExecutionPeriod', { ns: 'daoCreate' })}
          >
            <NumberInput
              value={vetoGuard.executionDetails.toString()}
              onChange={onExecutionDetailsChange}
              min={1}
              precision={0}
              data-testid="guardConfig-executionDetails"
              onKeyDown={restrictChars}
            >
              <InputGroup>
                <NumberInputField />
                <InputRightElement mr="4">{blocks}</InputRightElement>
              </InputGroup>
            </NumberInput>
          </LabelWrapper>
          <Text
            textStyle="text-sm-sans-regular"
            color="gold.400"
          >
            {t('exampleFreezeProposalBlockDuration', { ns: 'daoCreate' })}
          </Text>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelVetoVotesThreshold', { ns: 'daoCreate' })}
            subLabel={t('helperVetoVotesThreshold', { ns: 'daoCreate' })}
          >
            <NumberInput
              value={vetoGuard.vetoVotesThreshold.toString()}
              onChange={onVetoVotesThresholdChange}
              min={1}
              precision={0}
              data-testid="guardConfig-vetoVotesThreshold"
              onKeyDown={restrictChars}
            >
              <InputGroup>
                <NumberInputField />
                <InputRightElement mr="4">{votes}</InputRightElement>
              </InputGroup>
            </NumberInput>
          </LabelWrapper>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelFreezeVotesThreshold', { ns: 'daoCreate' })}
            subLabel={t('helperFreezeVotesThreshold', { ns: 'daoCreate' })}
          >
            <NumberInput
              value={vetoGuard.freezeVotesThreshold.toString()}
              onChange={onFreezeVotesThresholdChange}
              precision={0}
              data-testid="guardConfig-freezeVotesThreshold"
              onKeyDown={restrictChars}
            >
              <InputGroup>
                <NumberInputField />
                <InputRightElement mr="4">{votes}</InputRightElement>
              </InputGroup>
            </NumberInput>
          </LabelWrapper>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelFreezeProposalBlockDuration', { ns: 'daoCreate' })}
            subLabel={t('helperFreezeProposalBlockDuration', { ns: 'daoCreate' })}
          >
            <NumberInput
              value={vetoGuard.freezeProposalBlockDuration.toString()}
              onChange={onFreezeProposalBlockDurationChange}
              min={1}
              precision={0}
              data-testid="guardConfig-freezeProposalBlockDuration"
              onKeyDown={restrictChars}
            >
              <InputGroup>
                <NumberInputField />
                <InputRightElement mr="4">{blocks}</InputRightElement>
              </InputGroup>
            </NumberInput>
          </LabelWrapper>
          <Text
            textStyle="text-sm-sans-regular"
            color="gold.400"
          >
            {t('exampleFreezeProposalBlockDuration', { ns: 'daoCreate' })}
          </Text>
        </InputBox>
        <InputBox>
          <LabelWrapper
            label={t('labelFreezeBlockDuration', { ns: 'daoCreate' })}
            subLabel={t('helperFreezeBlockDuration', { ns: 'daoCreate' })}
          >
            <NumberInput
              value={vetoGuard.freezeBlockDuration.toString()}
              onChange={onFreezeBlockDurationChange}
              min={1}
              precision={0}
              data-testid="guardConfig-freezeBlockDuration"
              onKeyDown={restrictChars}
            >
              <InputGroup>
                <NumberInputField />
                <InputRightElement mr="4">{blocks}</InputRightElement>
              </InputGroup>
            </NumberInput>
          </LabelWrapper>
          <Text
            textStyle="text-sm-sans-regular"
            color="gold.400"
          >
            {t('exampleFreezeBlockDuration', { ns: 'daoCreate' })}
          </Text>
        </InputBox>
      </ContentBox>
      <ContentBanner description={t('vetoGuardDescription', { ns: 'daoCreate' })} />
    </Box>
  );
}

export default GuardDetails;
