import { type FC } from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';
import type { Message } from '../../types';
import { useAppTheme } from '../../hooks/useAppTheme';

const { Text } = Typography;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.padding * 2}px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.padding}px;
  min-height: ${({ theme }) => theme.controlHeight * 8}px;
  background: ${({ theme }) => theme.colorBgContainer};
  border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  border-radius: ${({ theme }) => theme.borderRadiusLG}px;
  box-shadow: ${({ theme }) => theme.boxShadowSecondary};
  margin: ${({ theme }) => theme.padding}px ${({ theme }) => theme.padding * 2}px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  align-self: ${({ isUser }) => (isUser ? 'flex-end' : 'flex-start')};
  background: ${({ theme, isUser }) =>
    isUser ? theme.colorPrimary : theme.colorBgElevated};
  color: ${({ theme, isUser }) =>
    isUser ? theme.colorTextLightSolid : theme.colorText};
  padding: ${({ theme }) => theme.padding}px ${({ theme }) => theme.padding * 2}px;
  border-radius: ${({ theme }) => theme.borderRadiusLG}px;
  box-shadow: ${({ theme }) => theme.boxShadowTertiary};
  position: relative;

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    ${({ isUser }) => (isUser ? 'right' : 'left')}: -8px;
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-top-color: ${({ theme, isUser }) =>
      isUser ? theme.colorPrimary : theme.colorBgElevated};
    border-bottom: 0;
    margin-bottom: -8px;
  }
`;

const Analysis = styled.div`
  margin-top: ${({ theme }) => theme.padding / 2}px;
  padding: ${({ theme }) => theme.padding}px;
  background: ${({ theme }) => theme.colorFillQuaternary};
  border-radius: ${({ theme }) => theme.borderRadiusLG}px;
  font-size: 0.9em;
`;

interface ChatMessagesProps {
  messages: Message[];
  showAnalysis: boolean;
}

const ChatMessages: FC<ChatMessagesProps> = ({ messages, showAnalysis }) => {
  const theme = useAppTheme();

  return (
    <MessagesContainer theme={theme}>
      {messages.map(message => (
        <MessageBubble key={message.id} isUser={message.isUser} theme={theme}>
          <Text style={{ color: 'inherit', whiteSpace: 'pre-wrap' }}>
            {message.content}
          </Text>
          {showAnalysis && message.analysis && (
            <Analysis theme={theme}>
              <Text type="secondary">{message.analysis}</Text>
            </Analysis>
          )}
        </MessageBubble>
      ))}
    </MessagesContainer>
  );
};

export default ChatMessages; 