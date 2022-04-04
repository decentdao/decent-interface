import React, {useState} from 'react'
import DAODetails from './DAODetails';
import GovernanceDetails from './GovernanceDetails';
import TokenDetails from './TokenDetails';

const CreateDAO = () => {
  const[step, setStep] = useState(0);
  const[formData, setFormData] = useState({
    DAOName: "",
    tokenName: "",
    tokenSymbol: "",
    tokenSupply: 0,
    proposalThreshold: 0,
    quorum: 4,
    executionDelay: 24, 
  })

  const FormTitles = ["Essentials", "Mint a New Token", "Governance Setup"];

  const StepDisplay = () => {
    if(step === 0) {
      return <DAODetails formData={formData} setFormData={setFormData}/>
    } else if(step === 1) {
      return <TokenDetails formData={formData} setFormData={setFormData}/>
    } else {
      return <GovernanceDetails formData={formData} setFormData={setFormData}/>
    }
  }


  return (
    <div className= "mx-24">
      <div className="mt-24 text-xl">{formData.DAOName === "" ? "New Fractal Configuration" : formData.DAOName + " - Configuration" }</div>
      <div className="container mx-auto bg-slate-100 px-8 mt-4 mb-8 pt-8 pb-8 content-center">
        <div className= "pb-8 text-lg">{FormTitles[step]}</div>
        <form>
          <div>{StepDisplay()}</div>
        </form>
      </div>
      <div className= "flex items-center justify-center">
        <button 
            disabled = {step === 0}
            className = "px-8 py-2 border rounded shadow items-center"
            onClick={ () =>
            {setStep((currPage) => currPage - 1)}
        }>
              Prev
        </button>
        <button 
          className = "px-8 py-2 border rounded shadow"
            onClick={ () =>
              {
                if(step === FormTitles.length - 1) {
                  console.log(formData)
                } else {
                  setStep((currPage) => currPage + 1)}
                }
              }> 
              {step === FormTitles.length - 1 ? "Submit" : "Next"}
          </button>
      </div>
    </div>
  )
}

export default CreateDAO