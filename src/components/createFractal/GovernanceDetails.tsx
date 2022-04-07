import CreateDAOInput from '../ui/CreateDAOInput'

const GovernanceDetails = ({ formData, setFormData }:
  {
    formData: {
      proposalThreshold: number,
      quorum: number,
      executionDelay: number,
    },
    setFormData: any,
  }
) => {
  return (
    <div>
      <CreateDAOInput
        dataType="text"
        value={formData.proposalThreshold}
        onChange={true}
        label="Proposal Threshold"
        helperText="How many tokens does it take to create a proposal?"
        disabled={true}
      />
      <CreateDAOInput
        dataType="text"
        value={formData.quorum}
        onChange={true}
        label="Quorum"
        helperText="What percentage of token votes are required in order for a proposal to pass"
        disabled={true}
      />
      <CreateDAOInput
        dataType="text"
        value={formData.executionDelay}
        onChange={true}
        label="Execution Delay"
        helperText="How long after a proposal passes must people wait until it can be executed?"
        disabled={true}
      />
    </div>
  )
}

export default GovernanceDetails