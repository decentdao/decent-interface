import React from 'react'

const GovernanceDetails = ({formData, setFormData}:
  {
    formData: {
      proposalThreshold: number,
      quorum: number,
      executionDelay: number, 
    },
    setFormData:any,
  }
  
  
  ) => {
  return (
    <div>
      <div className="text-sm">Proposal Threshold</div>
      <div className = "grid grid-cols-3 gap-4">
        <input 
        disabled={true}
        className="col-span-2 w-full border rounded py-1 px-2 shadow-inner"
        type ="number" 
        value= {formData.proposalThreshold} 
        onChange = {(event) => setFormData({...formData, proposalThreshold: event.target.value})}
        />
        <div className="text-sm text-center">How many tokens does it take to create a proposal?</div>
      </div>
      <div className="text-sm pt-4">Quorum</div>
      <div className = "grid grid-cols-3 gap-4">
        <input 
        disabled={true}
          className="col-span-2 w-full border rounded py-1 px-2 shadow-inner"
          type ="number" 
          value= {formData.quorum} 
          onChange = {(event) => setFormData({...formData, quorum: event.target.value})}
          />
        <div className="text-sm text-center">What percentage of token votes are required in order for a proposal to pass</div>
      </div>
      <div className="text-sm pt-4">Execution Delay</div>
      <div className = "grid grid-cols-3 gap-4"> 
        <input 
        disabled={true}
          className="col-span-2 w-full border rounded py-1 px-2 shadow-inner"
          type ="number" 
          value= {formData.executionDelay === 0 ? "" : formData.executionDelay} 
          onChange = {(event) => setFormData({...formData, executionDelay: event.target.value})}
        />
        <div className="text-sm text-center">How long after a proposal passes must people wait until it can be executed</div>
      </div>
    </div>
  )
}

export default GovernanceDetails