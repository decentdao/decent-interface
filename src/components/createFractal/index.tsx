import React, {useEffect, useState} from 'react'
import DAODetails from './DAODetails';
import GovernanceDetails from './GovernanceDetails';
import TokenDetails from './TokenDetails';
import { useWeb3 } from '../../web3';
import { useNavigate } from 'react-router';
import Button from '../ui/Button';
import ConnectModal from '../ConnectModal';
import DeployDAO from '../transactions/DeployDAO';
import { useTransaction } from '../transactions';


const CreateDAO = () => {
  let navigate = useNavigate();
  const { signerOrProvider } = useWeb3();
  const { account } = useWeb3();
  const { contractCall: contractCallDeploy } = useTransaction();

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
  const decrement = () => {
    setStep((currPage) => currPage - 1)
  }
  const increment = () => {
    setStep((currPage) => currPage + 1)
  }
    
      // Able to send transaction / checks for web3 connection - if not - it has a popup and asks for connection
      // todo: connect to real metafactory not dao creator
      // todo: move creat dao components to its own folder
      // todo: create Pending page during transction
  return (
    <div> 
      {
        !account ? <ConnectModal/> : <div/>
      }
      <div className= "mx-24">
        <div className="mt-24 text-xl">{formData.DAOName === "" ? "New Fractal Configuration" : formData.DAOName + " - Configuration" }</div>
        <div className="container mx-auto bg-slate-100 px-8 mt-4 mb-8 pt-8 pb-8 content-center">
          <div className= "pb-8 text-lg">{FormTitles[step]}</div>
          <form>
            <div>{StepDisplay()}</div>
          </form>
        </div>
        <div className= "flex items-center justify-center">
          <Button 
            onClick = {decrement}
            disabled = {step === 0}
          >
          Prev
          </Button>

          <Button 
            onClick = { () => {
              step === FormTitles.length - 1 ? 
              DeployDAO(formData.DAOName, formData.tokenName, formData.tokenSymbol, formData.tokenSupply, signerOrProvider, navigate, contractCallDeploy) : 
              increment()
            }
            }
            disabled = {false}
          >
          {step === FormTitles.length - 1 ? "Create DAO" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
  }

export default CreateDAO