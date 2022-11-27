import { Input } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import InputBox from '../ui/forms/InputBox';

function Essentials({
  proposalDescription,
  setProposalDescription,
}: {
  proposalDescription: string;
  setProposalDescription: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { t } = useTranslation('proposal');
  return (
    <ContentBox>
      <ContentBoxTitle>Essentials</ContentBoxTitle>
      <InputBox>
        <LabelWrapper
          label={t('labelProposalDesc')}
          subLabel={t('helperProposalDesc')}
        >
          <Input
            value={proposalDescription}
            onChange={e => setProposalDescription(e.target.value)}
          />
        </LabelWrapper>
      </InputBox>
    </ContentBox>
  );
}

export default Essentials;
