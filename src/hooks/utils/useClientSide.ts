import { useState, useEffect } from 'react';

// Context - https://github.com/chakra-ui/chakra-ui/issues/2601
// Shortly - Next.js yells if server and initial client value are different
// So we need to check are we rendering from client side or server side
// Since useEffect is called only on client - this is one of the ways to make sure context of execution is client side
export default function useClientSide() {
  const [isClientSide, setIsClientSide] = useState(false);
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  return isClientSide;
}
