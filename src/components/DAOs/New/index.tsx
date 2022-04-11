import { useState } from 'react'
import DAODetails from './DAODetails';
import TokenDetails from './TokenDetails';
import GovernanceDetails from './GovernanceDetails';
import Button from '../../ui/Button';
import ConnectModal from '../../ConnectModal';
import { useTransaction } from '../../transactions';
import { MetaFactory, MetaFactory__factory } from '../../../typechain-types';
import { useNavigate } from 'react-router';
import { useWeb3 } from '../../../web3';
import { ContractReceipt } from '@ethersproject/contracts';
import { BigNumber, ethers } from 'ethers';
import { useAddresses } from '../../../web3/chains';

const StepDisplay = ({
  step,
  setPrevEnabled,
  setNextEnabled,
  daoName,
  setDAOName,
  tokenName,
  setTokenName,
  tokenSymbol,
  setTokenSymbol,
  tokenSupply,
  setTokenSupply,
  proposalThreshold,
  quorum,
  executionDelay,
}: {
  step: number,
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  setNextEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  daoName: string | undefined,
  setDAOName: React.Dispatch<React.SetStateAction<string | undefined>>
  tokenName: string | undefined,
  setTokenName: React.Dispatch<React.SetStateAction<string | undefined>>,
  tokenSymbol: string | undefined,
  setTokenSymbol: React.Dispatch<React.SetStateAction<string | undefined>>,
  tokenSupply: number | undefined,
  setTokenSupply: React.Dispatch<React.SetStateAction<number | undefined>>,
  proposalThreshold: number | undefined,
  quorum: number | undefined,
  executionDelay: number | undefined,
}) => {
  if (step === 0) {
    return (
      <DAODetails
        setPrevEnabled={setPrevEnabled}
        setNextEnabled={setNextEnabled}
        name={daoName}
        setName={setDAOName}
      />
    );
  } else if (step === 1) {
    return (
      <TokenDetails
        setPrevEnabled={setPrevEnabled}
        setNextEnabled={setNextEnabled}
        name={tokenName}
        setName={setTokenName}
        symbol={tokenSymbol}
        setSymbol={setTokenSymbol}
        supply={tokenSupply}
        setSupply={setTokenSupply}
      />
    );
  } else if (step === 2) {
    return (
      <GovernanceDetails
        setPrevEnabled={setPrevEnabled}
        proposalThreshold={proposalThreshold}
        quorum={quorum}
        executionDelay={executionDelay}
      />
    );
  }
  return <></>
}

const New = () => {
  const { signerOrProvider, provider, chainId } = useWeb3();
  const  addresses  = useAddresses(chainId);
  let navigate = useNavigate();
  const { contractCall: contractCallDeploy } = useTransaction();

  const [step, setStep] = useState(0);

  const [prevEnabled, setPrevEnabled] = useState(false);
  const [nextEnabled, setNextEnabled] = useState(false);

  const [daoName, setDAOName] = useState<string>();
  const [tokenName, setTokenName] = useState<string>();
  const [tokenSymbol, setTokenSymbol] = useState<string>();
  const [tokenSupply, setTokenSupply] = useState<number>();
  const [proposalThreshold] = useState<number>(0);
  const [quorum] = useState<number>(4);
  const [executionDelay] = useState<number>(24);

  const decrement = () => {
    setStep((currPage) => currPage - 1);
  }

  const increment = () => {
    setStep((currPage) => currPage + 1);
  }

  const deployDAO = async (daoName: string, tokenName: string, tokenSymbol: string, tokenSupply: number) => {

    if (
        !signerOrProvider || 
        !daoName || 
        !tokenName || 
        !tokenSymbol || 
        !tokenSupply || 
        (!proposalThreshold && proposalThreshold !== 0) || 
        !quorum || 
        !executionDelay ||
        !addresses.metaFactory?.address ||
        !addresses.daoFactory?.address ||
        !addresses.dao?.address ||
        !addresses.accessControl?.address ||
        !addresses.treasuryModuleFactory?.address ||
        !addresses.treasuryModule?.address ||
        !addresses.tokenFactory?.address ||
        !addresses.governorFactory?.address ||
        !addresses.governorModule?.address ||
        !addresses.timelockUpgradeable?.address
      ) {
      return;
    }
    const factory: MetaFactory = MetaFactory__factory.connect(addresses.metaFactory?.address, signerOrProvider)
    const abiCoder = new ethers.utils.AbiCoder();

    const createDAOParams = {
      daoImplementation: addresses.dao?.address,
      accessControlImplementation: addresses.accessControl?.address,
      daoName: daoName,
      roles: [
        "EXECUTE_ROLE",
        "UPGRADE_ROLE",
        "WITHDRAWER_ROLE",
        "GOVERNOR_ROLE",
      ],
      rolesAdmins: ["DAO_ROLE", "DAO_ROLE", "DAO_ROLE", "DAO_ROLE"],
      members: [
        [],
        [],
        [],
        [],
      ],
      daoFunctionDescs: [
        "execute(address[],uint256[],bytes[])",
        "upgradeTo(address)",
      ],
      daoActionRoles: [["EXECUTE_ROLE"], ["UPGRADE_ROLE"]],
    };

    const moduleFactoriesCalldata = [
      {
        factory: addresses.treasuryModuleFactory?.address, // Treasury Factory
        data: [abiCoder.encode(["address"], [addresses.treasuryModule?.address])],
        value: 0,
        newContractAddressesToPass: [1],
        addressesReturned: 1,
      },
      {
        factory: addresses.tokenFactory?.address, // Token Factory
        data: [
          abiCoder.encode(["string"], [tokenName]),
          abiCoder.encode(["string"], [tokenSymbol]),
          abiCoder.encode(["address[]"], [[]]),
          abiCoder.encode(
            ["uint256[]"],
            [
              [],
            ]
          ),
          abiCoder.encode(["uint256"], [ethers.utils.parseUnits(tokenSupply.toString(), 18)]),
        ],
        value: 0,
        newContractAddressesToPass: [2],
        addressesReturned: 1,
      },
      {
        factory: addresses.governorFactory?.address, // Governor Factory
        data: [
          abiCoder.encode(["address"], [addresses.governorModule?.address]), // Governor Impl
          abiCoder.encode(["address"], [addresses.timelockUpgradeable?.address]), // Timelock Impl
          abiCoder.encode(["string"], [""]),
          abiCoder.encode(["uint64"], [BigNumber.from("0")]),
          abiCoder.encode(["uint256"], [BigNumber.from("1")]),
          abiCoder.encode(["uint256"], [BigNumber.from("5")]),
          abiCoder.encode(["uint256"], [BigNumber.from("0")]),
          abiCoder.encode(["uint256"], [BigNumber.from("4")]),
          abiCoder.encode(["uint256"], [BigNumber.from("1")]),
        ],
        value: 0,
        newContractAddressesToPass: [0, 1, 3],
        addressesReturned: 2,
      },
    ];

    const moduleActionCalldata = {
      contractIndexes: [2, 2, 2, 2, 2, 2, 4, 5, 5, 5, 5, 5],
      functionDescs: [
        "withdrawEth(address[],uint256[])",
        "depositERC20Tokens(address[],address[],uint256[])",
        "withdrawERC20Tokens(address[],address[],uint256[])",
        "depositERC721Tokens(address[],address[],uint256[])",
        "withdrawERC721Tokens(address[],address[],uint256[])",
        "upgradeTo(address)",
        "upgradeTo(address)",
        "upgradeTo(address)",
        "updateDelay(uint256)",
        "scheduleBatch(address[],uint256[],bytes[],bytes32,bytes32,uint256)",
        "cancel(bytes32)",
        "executeBatch(address[],uint256[],bytes[],bytes32,bytes32)",
      ],
      roles: [
        ["WITHDRAWER_ROLE"],
        ["WITHDRAWER_ROLE"],
        ["WITHDRAWER_ROLE"],
        ["WITHDRAWER_ROLE"],
        ["WITHDRAWER_ROLE"],
        ["UPGRADE_ROLE"],
        ["UPGRADE_ROLE"],
        ["UPGRADE_ROLE"],
        ["GOVERNOR_ROLE"],
        ["GOVERNOR_ROLE"],
        ["GOVERNOR_ROLE"],
        ["GOVERNOR_ROLE"],
      ],
    };

    contractCallDeploy(
      () => factory.createDAOAndModules(
        addresses.daoFactory?.address!,
        0,
        createDAOParams,
        moduleFactoriesCalldata,
        moduleActionCalldata,
        [[5], [0], [0], [4]]
      ),
      'Deploying',
      'Deploy failed',
      'Deploy succeeded',
      undefined,
      undefined,
      async (receipt: ContractReceipt) => {
        const event = receipt.events?.filter((x) => {
          return x.address === addresses.daoFactory?.address;
        });
        if (
          event === undefined ||
          event[0].topics[1] === undefined
        ) {
          return "";
        } else {
          const daoAddress = abiCoder.decode(["address"], event[0].topics[1]);
          navigate(`/daos/${daoAddress}`,)
        }
      }
    );
  }

  return (
    <div>
      <ConnectModal />
      <div className="mx-24">
        <div className="mt-24 text-xl">{!daoName || daoName.trim() === "" ? "New Fractal Configuration" : daoName + " - Configuration"}</div>
        <div className="mx-auto bg-slate-100 px-8 mt-4 mb-8 pt-8 pb-8 content-center">
          <form onSubmit={e => e.preventDefault()}>
            <StepDisplay
              step={step}
              setPrevEnabled={setPrevEnabled}
              setNextEnabled={setNextEnabled}
              daoName={daoName}
              setDAOName={setDAOName}
              tokenName={tokenName}
              setTokenName={setTokenName}
              tokenSymbol={tokenSymbol}
              setTokenSymbol={setTokenSymbol}
              tokenSupply={tokenSupply}
              setTokenSupply={setTokenSupply}
              proposalThreshold={proposalThreshold}
              quorum={quorum}
              executionDelay={executionDelay}
            />
          </form>
        </div>

        <div className="flex items-center justify-center">
          {step > 0 && (
            <Button
              onClick={decrement}
              disabled={!prevEnabled}
            >
              Prev
            </Button>
          )}
          {step < 2 && (
            <Button
              onClick={increment}
              disabled={!nextEnabled}
            >
              Next
            </Button>
          )}
          {step > 1 && (
            <Button onClick={async () => {
              if (!daoName || !tokenName || !tokenSymbol || !tokenSupply) { return }
              deployDAO(daoName, tokenName, tokenSymbol, tokenSupply)
            }
            }>
              Create DAO
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default New;