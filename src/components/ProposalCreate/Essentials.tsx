import { useTranslation } from 'react-i18next';
import ContentBox from '../ui/ContentBox';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import Input from '../ui/forms/Input';
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
        <Input
          type="text"
          value={proposalDescription}
          onChange={e => setProposalDescription(e.target.value)}
          label={t('labelProposalDesc')}
          helperText={t('helperProposalDesc')}
          disabled={false}
        />
      </InputBox>
    </ContentBox>
  );
}

export default Essentials;
