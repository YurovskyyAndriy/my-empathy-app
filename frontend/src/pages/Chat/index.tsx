import { type FC, useState } from 'react';
import styled from 'styled-components';
import { Switch, Space, Typography, Layout, message } from 'antd';
import type { Message } from '../../types';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { useAppTheme } from '../../hooks/useAppTheme';
import { API_URL } from '../../config';

const { Title } = Typography;
const { Content } = Layout;

const PageContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - ${({ theme }) => theme.headerHeight}px);
  background: transparent;
`;

const HeaderSection = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.headerHeight}px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 800px;
  background: transparent;
  padding: ${({ theme }) => theme.padding}px ${({ theme }) => theme.padding * 2}px 0;
  z-index: 99;

  .ant-typography {
    margin-bottom: ${({ theme }) => theme.padding / 2}px;
    color: ${({ theme }) => theme.colorTextHeading};
  }

  .ant-space {
    margin-bottom: 0;
  }
`;

const ChatContainer = styled(Content)`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: calc(${({ theme }) => theme.headerHeight + theme.padding + 108}px);
  margin-bottom: ${({ theme }) => theme.controlHeight * 2 + theme.padding * 2}px;
  background: transparent;
`;

interface ChatProps {}

const Chat: FC<ChatProps> = () => {
  const theme = useAppTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (content: string) => {
    try {
      setIsLoading(true);
      
      // Add user message immediately
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        isUser: true,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Send message to backend
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: content,
          userId: 'test-user', // TODO: Replace with actual user ID
          sessionId: Date.now().toString() // TODO: Use proper session management
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();
      
      // Add bot response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        isUser: false,
        analysis: data.analysis,
        timestamp: Date.now() + 1,
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      message.error('Failed to send message. Please try again.');
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer theme={theme}>
      <HeaderSection theme={theme}>
        <Title level={2}>Empathy Chat</Title>
        <Space>
          <Switch
            checked={showAnalysis}
            onChange={setShowAnalysis}
            checkedChildren="Hide Analysis"
            unCheckedChildren="Show Analysis"
          />
        </Space>
      </HeaderSection>
      <ChatContainer theme={theme}>
        <ChatMessages messages={messages} showAnalysis={showAnalysis} />
      </ChatContainer>
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </PageContainer>
  );
};

export default Chat;