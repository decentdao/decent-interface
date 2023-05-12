import { Avatar, Flex, Text } from '@chakra-ui/react';
import { VEllipsis } from '@decent-org/fractal-ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import useRemoveProposalTemplate from '../../hooks/DAO/proposal/useRemoveProposalTemplate';
import useSubmitProposal from '../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../providers/App/AppProvider';
import { ProposalTemplate } from '../../types/createProposalTemplate';
import ContentBox from '../ui/containers/ContentBox';
import { OptionMenu } from '../ui/menus/OptionMenu';

type ProposalTemplateCardProps = {
  proposalTemplate: ProposalTemplate;
  templateIndex: number;
};

export default function ProposalTemplateCard({
  proposalTemplate: { title, description },
  templateIndex,
}: ProposalTemplateCardProps) {
  const { push } = useRouter();
  const { t } = useTranslation('proposalTemplate');
  const {
    node: { safe, daoAddress },
  } = useFractal();

  const { prepareRemoveProposalTemplateProposal } = useRemoveProposalTemplate();
  const { submitProposal, canUserCreateProposal } = useSubmitProposal();

  const successCallback = () => {
    if (daoAddress) {
      // Redirecting to proposals page so that user will see Proposal for Proposal Template creation
      push(`/daos/${daoAddress}/proposals`);
    }
  };

  const nonce = safe?.nonce;
  const handleRemoveTemplate = async () => {
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
  };

  const manageTemplateOptions = [];
  if (canUserCreateProposal) {
    const removeTemplateOption = {
      optionKey: 'optionRemoveTemplate',
      onClick: handleRemoveTemplate,
    };
    manageTemplateOptions.push(removeTemplateOption);
  }

  return (
    <ContentBox containerBoxProps={{ width: '420px' }}>
      <Flex justifyContent="space-between">
        <Avatar
          size="lg"
          w="50px"
          h="50px"
          name={title}
          borderRadius="4px"
          getInitials={(_title: string) => _title.slice(0, 2)}
        />
        {manageTemplateOptions.length > 0 && (
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
        )}
      </Flex>
      <Text
        textStyle="text-lg-mono-regular"
        color="grayscale.100"
        marginTop="2rem"
        marginBottom="0.5rem"
      >
        {title}
      </Text>
      <Text
        textStyle="text-sm-mono-regular"
        color="grayscale.100"
      >
        {description}
      </Text>
    </ContentBox>
  );
}
