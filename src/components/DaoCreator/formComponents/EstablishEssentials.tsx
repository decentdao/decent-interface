import { ens_normalize } from '@adraffy/ens-normalize';
import { Box, Divider, Input, RadioGroup } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { URL_DOCS_GOV_TYPES } from '../../../constants/url';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import {
  ICreationStepProps,
  CreatorSteps,
  VotingStrategyType,
  GovernanceType,
} from '../../../types';
import { InputComponent, LabelComponent } from '../../ui/forms/InputComponent';
import { RadioWithText } from '../../ui/forms/Radio/RadioWithText';
import ExternalLink from '../../ui/links/ExternalLink';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';

export enum DAOCreateMode {
  ROOTDAO,
  SUBDAO,
  EDIT,
}

export function EstablishEssentials(props: ICreationStepProps) {
  const { t } = useTranslation(['daoCreate', 'common']);
  const { values, setFieldValue, isSubmitting, transactionPending, isSubDAO, errors, mode } = props;

  const [isSnapshotSpaceValid, setSnapshotSpaceValid] = useState(false);

  const {
    node: { daoName, daoSnapshotURL, daoAddress },
  } = useFractal();

  const isEdit = mode === DAOCreateMode.EDIT;

  useEffect(() => {
    if (isEdit) {
      setFieldValue('essentials.daoName', daoName, false);
      if (createAccountSubstring(daoAddress!) !== daoName) {
        // Pre-fill the snapshot URL form field when editing
        setFieldValue('essentials.snapshotURL', daoSnapshotURL || '', false);
      }
    }
  }, [setFieldValue, mode, daoName, daoSnapshotURL, isEdit, daoAddress]);

  const daoNameDisabled =
    isEdit && !!daoName && !!daoAddress && createAccountSubstring(daoAddress) !== daoName;

  // If in governance edit mode and snapshot URL is already set, disable the field
  const snapshotURLDisabled = isEdit && !!daoSnapshotURL;

  const handleGovernanceChange = (value: string) => {
    if (value === GovernanceType.AZORIUS_ERC20) {
      setFieldValue('azorius.votingStrategyType', VotingStrategyType.LINEAR_ERC20);
    } else if (value === GovernanceType.AZORIUS_ERC721) {
      setFieldValue('azorius.votingStrategyType', VotingStrategyType.LINEAR_ERC721);
    }

    setFieldValue('essentials.governance', value);
  };

  const handleSnapshotSpaceChange = (value: string) => {
    setFieldValue('essentials.snapshotURL', value, true);
    try {
      ens_normalize(value);
      setSnapshotSpaceValid(true);
    } catch (error) {
      console.log(error);
      // If there's no input in the snapshot URL field, we don't need to check if it's valid
      setSnapshotSpaceValid(!!value ? false : true);
    }
  };

  const { createOptions } = useNetworkConfig();

  return (
    <StepWrapper
      mode={mode}
      isSubDAO={isSubDAO}
      isFormSubmitting={!!isSubmitting || transactionPending}
      titleKey="titleEssentials"
    >
      <InputComponent
        label={t('labelFractalName')}
        helper={t('helperFractalName')}
        isRequired
        value={values.essentials.daoName}
        id="searchEssentials-daoName"
        onChange={cEvent => setFieldValue('essentials.daoName', cEvent.target.value, true)}
        onBlur={cEvent => setFieldValue('essentials.daoName', cEvent.target.value.trim(), true)}
        disabled={daoNameDisabled}
        placeholder={t('daoNamePlaceholder')}
        testId="essentials-daoName"
      />
      <Box my={8}>
        <LabelComponent
          label={t('labelChooseGovernance')}
          helper={t('helperChooseGovernance')}
          isRequired
        >
          <RadioGroup
            bg={BACKGROUND_SEMI_TRANSPARENT}
            px={8}
            py={4}
            rounded="lg"
            display="flex"
            flexDirection="column"
            name="governance"
            gap={4}
            id="governance"
            value={values.essentials.governance}
            onChange={handleGovernanceChange}
          >
            {createOptions.includes(GovernanceType.MULTISIG) && (
              <RadioWithText
                label={t('labelMultisigGov')}
                description={t('descMultisigGov')}
                testId="choose-multisig"
                value={GovernanceType.MULTISIG}
                tooltip={
                  <Trans
                    i18nKey="tooltipMultisig"
                    ns="daoCreate"
                  >
                    placeholder
                    <ExternalLink href={URL_DOCS_GOV_TYPES}>link</ExternalLink>
                  </Trans>
                }
              />
            )}
            {createOptions.includes(GovernanceType.AZORIUS_ERC20) && (
              <RadioWithText
                label={t('labelAzoriusErc20Gov')}
                description={t('descAzoriusErc20Gov')}
                testId="choose-azorius"
                value={GovernanceType.AZORIUS_ERC20}
                tooltip={
                  <Trans
                    i18nKey="tooltipTokenVoting"
                    ns="daoCreate"
                  >
                    placeholder
                    <ExternalLink href={URL_DOCS_GOV_TYPES}>link</ExternalLink>
                  </Trans>
                }
              />
            )}
            {createOptions.includes(GovernanceType.AZORIUS_ERC721) && (
              <RadioWithText
                label={t('labelAzoriusErc721Gov')}
                description={t('descAzoriusErc721Gov')}
                testId="choose-azorius-erc721"
                value={GovernanceType.AZORIUS_ERC721}
                tooltip={
                  <Trans
                    i18nKey="tooltipNftVoting"
                    ns="daoCreate"
                  >
                    placeholder
                    <ExternalLink href={URL_DOCS_GOV_TYPES}>link</ExternalLink>
                  </Trans>
                }
              />
            )}
          </RadioGroup>
        </LabelComponent>
      </Box>
      <Divider
        color="chocolate.700"
        mb="2rem"
      />
      <LabelComponent
        label={t('snapshot')}
        helper={t('snapshotHelper')}
        isRequired={false}
      >
        <LabelWrapper errorMessage={errors?.essentials?.snapshotURL}>
          <Input
            value={values.essentials.snapshotURL}
            onChange={cEvent => handleSnapshotSpaceChange(cEvent.target.value)}
            isDisabled={snapshotURLDisabled}
            data-testid="essentials-snapshotURL"
            placeholder="example.eth"
          />
        </LabelWrapper>
      </LabelComponent>
      <Divider
        color="chocolate.700"
        mt="2rem"
        mb="2rem"
      />
      <StepButtons
        {...props}
        isNextDisabled={
          !isSnapshotSpaceValid ||
          values.essentials.daoName.length === 0 || // TODO formik should do this, not sure why it's enabled on first pass
          (isEdit && values.essentials.governance === GovernanceType.MULTISIG)
        }
        isEdit={isEdit}
        nextStep={
          values.essentials.governance === GovernanceType.MULTISIG
            ? CreatorSteps.MULTISIG_DETAILS
            : values.azorius.votingStrategyType === VotingStrategyType.LINEAR_ERC20
              ? CreatorSteps.ERC20_DETAILS
              : CreatorSteps.ERC721_DETAILS
        }
      />
    </StepWrapper>
  );
}
