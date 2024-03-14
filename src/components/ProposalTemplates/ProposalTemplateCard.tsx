import { Avatar, Flex, Text } from '@chakra-ui/react';
import { VEllipsis } from '@decent-org/fractal-ui';
import { useRouter } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DAO_ROUTES } from '../../constants/routes';
import useRemoveProposalTemplate from '../../hooks/DAO/proposal/useRemoveProposalTemplate';
import useSubmitProposal from '../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../providers/App/AppProvider';
import { ProposalTemplate } from '../../types/createProposalTemplate';
import ContentBox from '../ui/containers/ContentBox';
import { OptionMenu } from '../ui/menus/OptionMenu';
import { ModalType } from '../ui/modals/ModalProvider';
import { useFractalModal } from '../ui/modals/useFractalModal';
import Markdown from '../ui/proposal/Markdown';

type ProposalTemplateCardProps = {
  proposalTemplate: ProposalTemplate;
  templateIndex: number;
};

export default function ProposalTemplateCard({
  proposalTemplate,
  templateIndex,
}: ProposalTemplateCardProps) {
  const { push } = useRouter();
  const { t } = useTranslation('proposalTemplate');
  const {
    node: { safe, daoAddress },
  } = useFractal();

  const { prepareRemoveProposalTemplateProposal } = useRemoveProposalTemplate();
  const { submitProposal, canUserCreateProposal } = useSubmitProposal();
  const { title, description } = proposalTemplate;

  const openProposalForm = useFractalModal(ModalType.CREATE_PROPOSAL_FROM_TEMPLATE, {
    proposalTemplate,
  });
  const openForkTemplateForm = useFractalModal(ModalType.COPY_PROPOSAL_TEMPLATE, {
    proposalTemplate,
    templateIndex,
  });

  const successCallback = useCallback(() => {
    if (daoAddress) {
      // Redirecting to proposals page so that user will see Proposal for Proposal Template creation
      push(DAO_ROUTES.proposals.relative(daoAddress));
    }
  }, [push, daoAddress]);

  const nonce = safe?.nonce;
  const handleRemoveTemplate = useCallback(async () => {
    const proposalData = await prepareRemoveProposalTemplateProposal(templateIndex);
    if (!!proposalData) {
      submitProposal({
        proposalData,
        nonce,
        pendingToastMessage: t('removeTemplatePendingToastMessage'),
        successToastMessage: t('removeTemplateSuccessToastMessage'),
        failedToastMessage: t('removeTemplateFailureToastMessage'),
        successCallback,
      });
    }
  }, [
    nonce,
    prepareRemoveProposalTemplateProposal,
    submitProposal,
    successCallback,
    t,
    templateIndex,
  ]);

  const manageTemplateOptions = useMemo(() => {
    let options = [];
    const forkTemplateOption = {
      optionKey: 'optionForkTemplate',
      onClick: openForkTemplateForm,
    };
    if (canUserCreateProposal) {
      const removeTemplateOption = {
        optionKey: 'optionRemoveTemplate',
        onClick: handleRemoveTemplate,
      };
      options.push(removeTemplateOption);
    }

    options.push(forkTemplateOption);

    return options;
  }, [canUserCreateProposal, openForkTemplateForm, handleRemoveTemplate]);

  return (
    <ContentBox
      containerBoxProps={{ flex: '0 0 calc(33.333333% - 0.6666666rem)', my: '0' }}
      onClick={canUserCreateProposal ? openProposalForm : undefined}
    >
      <Flex justifyContent="space-between">
        <Avatar
          size="lg"
          w="50px"
          h="50px"
          name={title}
          borderRadius="4px"
          getInitials={(_title: string) => _title.slice(0, 2)}
        />
        <OptionMenu
          trigger={
            <VEllipsis
              boxSize="1.5rem"
              mt="0.25rem"
            />
          }
          titleKey="titleManageProposalTemplate"
          options={manageTemplateOptions}
          namespace="menu"
        />
      </Flex>
      <Text
        textStyle="text-lg-mono-regular"
        color="grayscale.100"
        marginTop="2rem"
        marginBottom="0.5rem"
      >
        {title}
      </Text>
      <Markdown content={description}/>
    </ContentBox>
  );
}
