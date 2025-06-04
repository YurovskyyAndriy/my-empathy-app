import { type FC, useEffect, useState } from 'react';
import { Progress, Typography } from 'antd';
import styled from 'styled-components';

const { Text } = Typography;

const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
`;

interface AnalysisTimerProps {
  showAnalysis: boolean;
  onComplete?: () => void;
}

const AnalysisTimer: FC<AnalysisTimerProps> = ({ showAnalysis, onComplete }) => {
  const maxTime = showAnalysis ? 60 : 20;
  const [timeLeft, setTimeLeft] = useState(maxTime);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [timeLeft, onComplete]);

  const percent = Math.max(0, (timeLeft / maxTime) * 100);

  return (
    <TimerContainer>
      <Progress
        type="circle"
        percent={percent}
        format={() => (
          <Text>
            {timeLeft > 0 ? `${timeLeft}s` : 'Almost there...'}
          </Text>
        )}
        status={timeLeft > 0 ? 'active' : 'success'}
        size={120}
      />
      <Text type="secondary">
        {timeLeft > 0
          ? 'Analyzing your message...'
          : 'Finalizing the analysis...'}
      </Text>
    </TimerContainer>
  );
};

export default AnalysisTimer; 