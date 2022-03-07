import { useState, useEffect } from 'react';
import packageJson from '../../../package.json'
import { useWeb3 } from '../../web3';

function Footer() {
  const { networkName, providerName } = useWeb3();

  const [emoji, setEmoji] = useState("");
  useEffect(() => {
    const emojis = ["🦺", "❤️", "🖤", "💜", "😘", "😻", "💖", "🎉", "✨", "🔥", "❤️‍🔥", "☠️", "🥰", "👻", "💋", "🎃", "👽", "🤌", "💪", "👌", "👁", "🧠", "🌝", "🌚", "🌈", "🌙", "☃️", "🍑", "🍆", "🎱"];
    setEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
  }, []);

  return (
    <footer className="py-4 border-t text-xs sm:text-sm">
      <div className="container flex flex-col-reverse sm:flex-row sm:justify-between sm:items-end">
        <div className="text-right sm:text-left">
          <div className="font-mono text-xs">v{packageJson.version}{process.env.REACT_APP_GIT_HASH && `+${process.env.REACT_APP_GIT_HASH}`}</div>
          <div>made with <span className="mr-1">{emoji}</span> by <a href="https://decentlabs.io" target="_blank" rel="noreferrer">decent dao</a> in the ether 🌴</div>
        </div>
        <div className="text-right">
          <div>{networkName && `${networkName} via `}{providerName}</div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;