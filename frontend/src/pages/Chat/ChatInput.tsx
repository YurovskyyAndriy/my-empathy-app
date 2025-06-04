import { type FC, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import styled from 'styled-components';
import { Button, Input } from 'antd';
import { SendOutlined, AudioOutlined } from '@ant-design/icons';
import { useAppTheme } from '../../hooks/useAppTheme';

const { TextArea } = Input;

const InputContainer = styled.div`
  position: fixed;
  bottom: ${({ theme }) => theme.controlHeight + theme.padding}px;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colorBgContainer};
  padding: ${({ theme }) => theme.padding}px 0;
  border-top: 1px solid ${({ theme }) => theme.colorBorderSecondary};
  z-index: 98;
`;

const InputWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: ${({ theme }) => theme.padding}px;
  padding: 0 ${({ theme }) => theme.padding * 2}px;
  align-items: flex-end;

  .ant-input-textarea {
    flex: 1;
    textarea {
      resize: none;
      border-radius: ${({ theme }) => theme.borderRadius}px;
      background: ${({ theme }) => theme.colorFillTertiary};
      border: 1px solid ${({ theme }) => theme.colorBorderSecondary};
      padding: 4px 11px;
      
      &:hover, &:focus {
        border-color: ${({ theme }) => theme.colorPrimary};
        box-shadow: none;
      }
    }
  }

  .ant-btn {
    border-radius: ${({ theme }) => theme.borderRadius}px;
    height: 32px;
    width: 32px;
    min-width: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .anticon {
      font-size: 16px;
    }
  }
`;

interface ChatInputProps {
  onSend: (content: string) => void;
  isLoading?: boolean;
}

const ChatInput: FC<ChatInputProps> = ({ onSend, isLoading = false }) => {
  const theme = useAppTheme();
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      onSend(inputText.trim());
      setInputText('');
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <InputContainer theme={theme}>
      <InputWrapper theme={theme}>
        <TextArea
          value={inputText}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          disabled={isLoading}
        />
        <Button
          icon={<AudioOutlined />}
          onClick={handleVoiceRecord}
          type={isRecording ? 'primary' : 'default'}
          disabled={isLoading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={isLoading}
        />
      </InputWrapper>
    </InputContainer>
  );
};

export default ChatInput; 