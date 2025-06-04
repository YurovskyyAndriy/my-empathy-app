import { useEffect, useRef } from 'react';
import type { FC } from 'react';
import styled from 'styled-components';

const WaveformContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  height: 32px;
`;

const Bar = styled.div<{ $height: number }>`
  width: 3px;
  height: ${props => props.$height}px;
  background-color: ${({ theme }) => theme.colorPrimary};
  border-radius: 1px;
  transition: height 0.1s ease;
`;

interface AudioWaveformProps {
  isRecording: boolean;
}

const AudioWaveform: FC<AudioWaveformProps> = ({ isRecording }) => {
  const animationRef = useRef<number>();
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isRecording) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = () => {
      if (!barsRef.current) return;
      
      const bars = barsRef.current.children;
      for (let i = 0; i < bars.length; i++) {
        const bar = bars[i] as HTMLDivElement;
        const height = Math.random() * 24 + 8; // Random height between 8px and 32px
        bar.style.height = `${height}px`;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording]);

  return (
    <WaveformContainer ref={barsRef}>
      {Array.from({ length: 10 }).map((_, i) => (
        <Bar key={i} $height={4} />
      ))}
    </WaveformContainer>
  );
};

export default AudioWaveform; 