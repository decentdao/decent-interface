import { useEffect } from 'react';

export const useETHLizardsScript = (daoAddress: string | null) => {
  useEffect(() => {
    // @todo Goerli is deprecated, replace this once they have a new DAO
    const ethLizardsGOERLIAddress = '0x167bE4073f52aD2Aa0D6d6FeddF0F1f79a82B98e';
    const src = `https://lizarddao.com/api/v1/dao/${ethLizardsGOERLIAddress}/script`;
    const scriptExists = document.querySelector(`script[src="${src}"]`);
    if (scriptExists) {
      return;
    }
    if(scriptExists && daoAddress !== ethLizardsGOERLIAddress) {
      document.body.removeChild(scriptExists);
      return
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = function() {
      window.hj = window.hj || function() { (window.hj.q = window.hj.q || []).push(arguments as unknown as [string, any[]]); };
      window._hjSettings = { hjid: 3776270, hjsv: 6 };
    };

    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, [daoAddress]); // Adjusted dependency array
};
