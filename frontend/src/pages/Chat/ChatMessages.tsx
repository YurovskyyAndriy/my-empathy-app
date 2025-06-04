import { type FC } from 'react';
import styled from 'styled-components';
import { Typography, Descriptions } from 'antd';
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
  margin-top: ${({ theme }) => theme.padding}px;
  padding: ${({ theme }) => theme.padding}px;
  background: ${({ theme }) => theme.colorFillQuaternary};
  border-radius: ${({ theme }) => theme.borderRadiusLG}px;
  font-size: 0.9em;

  .ant-descriptions {
    .ant-descriptions-item-label {
      color: ${({ theme }) => theme.colorTextSecondary};
      font-weight: 500;
    }
    .ant-descriptions-item-content {
      color: ${({ theme }) => theme.colorText};
    }
  }
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
          {showAnalysis && message.response?.analysis && !message.isUser && (
            <Analysis theme={theme}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Self Awareness">
                  <div>
                    <div>Emotional Background: {message.response.analysis.self_awareness.emotional_background}</div>
                    <div>Present Elements: {message.response.analysis.self_awareness.present_elements}</div>
                    <div>Missing Elements: {message.response.analysis.self_awareness.missing_elements}</div>
                    <div>Step Back Analysis: {message.response.analysis.self_awareness.step_back_analysis}</div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Self Regulation">
                  <div>
                    <div>Current Phrasing: {message.response.analysis.self_regulation.current_phrasing}</div>
                    <div>Improvement Examples: {message.response.analysis.self_regulation.improvement_examples}</div>
                    <div>Alternative Phrases: {message.response.analysis.self_regulation.alternative_phrases}</div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Empathy">
                  <div>
                    <div>Missing Elements: {message.response.analysis.empathy.missing_elements}</div>
                    <div>Potential Additions: {message.response.analysis.empathy.potential_additions}</div>
                    <div>Understanding Examples: {message.response.analysis.empathy.understanding_examples}</div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Social Skills">
                  <div>
                    <div>Current Impact: {message.response.analysis.social_skills.current_impact}</div>
                    <div>Improvements: {message.response.analysis.social_skills.improvements}</div>
                    <div>Examples: {message.response.analysis.social_skills.examples}</div>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Analysis>
          )}
        </MessageBubble>
      ))}
    </MessagesContainer>
  );
};

export default ChatMessages; 