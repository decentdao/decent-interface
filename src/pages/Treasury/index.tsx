import ContentBoxTitle from "../../components/ui/ContentBoxTitle";
import EtherscanLink from "../../components/ui/EtherscanLink";
import H1 from "../../components/ui/H1";
import { useDAOData } from "../../contexts/daoData";

const Treasury = () => {
  const [{ treasuryAssets, name}] = useDAOData();
  return (
    <div>
      <H1>{name} Treasury</H1>
      <div className="rounded-lg p-4 shadow-2xl my-4 bg-gray-600">
        <ContentBoxTitle>Treasury</ContentBoxTitle>
        <div className="my-2">
          <div className="flex justify-between items-end bg-gray-400 px-4 pb-2 h-10">
            <div className="flex">
              <div className="text-gray-50 text-xs font-medium w-16 sm:w-28">Symbol</div>
              <div className="text-gray-50 text-xs font-medium">Name</div>
            </div>
            <div className="text-gray-50 text-xs font-medium">Amount</div>
          </div>
          {treasuryAssets.map((asset) => (
            <div className="flex justify-between items-center bg-gray-500 px-4 py-5 border-t border-b border-gray-200" key={asset.contractAddress}>
              <div className="flex">
                <EtherscanLink address={asset.contractAddress}>
                  <div className="text-gold-500 w-16 sm:w-28">{asset.symbol}</div>
                </EtherscanLink>
                <div className="text-gray-25 font-medium">{asset.name}</div>
              </div>
              <div className="text-gray-25 font-mono font-semibold tracking-wider">{asset.formatedTotal}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Treasury;
