import { type FC, useState } from 'react';
import styled from 'styled-components';
import { Layout } from 'antd';
import type { Message } from '../../types';
import { useAppTheme } from '../../hooks/useAppTheme';
import { API_URL } from '../../config';
import MessageInputForm from '../../components/MessageInputForm';
import AnalysisTimer from '../../components/AnalysisTimer';
import AnalysisResults from '../../components/AnalysisResults';

const { Content } = Layout;

const PageContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.padding * 2}px;
  min-height: calc(100vh - ${({ theme }) => theme.headerHeight}px);
  background: transparent;
`;

const ContentContainer = styled(Content)`
  margin-top: ${({ theme }) => theme.headerHeight}px;
  background: transparent;
`;

interface ChatProps {}

const Chat: FC<ChatProps> = () => {
  const theme = useAppTheme();
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSend = async (content: string) => {
    try {
      setIsLoading(true);
      setShowResults(false);
      
      // Create message object
      const message: Message = {
        id: Date.now().toString(),
        content,
        isUser: true,
        timestamp: Date.now(),
      };
      setCurrentMessage(message);

      // Choose endpoint based on showAnalysis toggle
      const endpoint = showAnalysis ? 'analyzeMessage' : 'rewriteMessage';
      
      // Send message to backend
      const response = await fetch(`${API_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: content }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Update message with response
      setCurrentMessage(prev => 
        prev ? {
          ...prev,
          response: data
        } : null
      );
      
      setShowResults(true);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskAgain = () => {
    setShowResults(false);
    if (currentMessage) {
      handleSend(currentMessage.content);
    }
  };

  return (
    <PageContainer theme={theme}>
      <ContentContainer theme={theme}>
        {!isLoading && !showResults && (
          <MessageInputForm
            onSubmit={handleSend}
            isLoading={isLoading}
            showAnalysis={showAnalysis}
            onToggleAnalysis={setShowAnalysis}
          />
        )}
        
        {isLoading && (
          <AnalysisTimer
            showAnalysis={showAnalysis}
            onComplete={() => setShowResults(true)}
          />
        )}
        
        {showResults && currentMessage && (
          <AnalysisResults 
            message={currentMessage}
            onAskAgain={handleAskAgain}
          />
        )}
      </ContentContainer>
    </PageContainer>
  );
};

export default Chat;