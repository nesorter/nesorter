import { useState } from "react";
import { Box, StatedButton, Text } from "../../components";

const StatusPage = () => {
  const [flag, setFlag] = useState(false);

  return (
    <StatedButton flag={flag} onNextState={setFlag}>
      wtf {flag ? '1' : '0'}
    </StatedButton>
  );
}

export default StatusPage;
