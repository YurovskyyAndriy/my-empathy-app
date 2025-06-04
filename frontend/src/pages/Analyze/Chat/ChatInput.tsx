import { type FC, useState, type ChangeEvent, type KeyboardEvent, useRef } from 'react';
import styled from 'styled-components';
import { Button, Input, message } from 'antd';
import { SendOutlined, AudioOutlined, BugOutlined } from '@ant-design/icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import AudioWaveform from '../../components/AudioWaveform';
import { API_URL } from '../../config';

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      onSend(inputText.trim());
      setInputText('');
    }
  };

  const testMicrophoneAccess = async () => {
    console.log('Testing microphone access...');
    console.log('navigator.mediaDevices:', navigator.mediaDevices);
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log('Available devices:', devices);
      
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      console.log('Audio input devices:', audioDevices);
      
      if (audioDevices.length === 0) {
        message.error('Микрофон не найден');
        return;
      }
      
      message.info(`Найдено микрофонов: ${audioDevices.length}`);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Successfully got media stream:', stream);
        message.success('Доступ к микрофону получен');
        stream.getTracks().forEach(track => {
          console.log('Audio track:', track);
          track.stop();
        });
      } catch (err) {
        console.error('Error accessing microphone:', err);
        message.error('Ошибка доступа к микрофону');
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
      message.error('Ошибка при поиске устройств');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstart = () => {
        setIsRecording(true);
        message.info('Запись началась...');
      };

      recorder.onerror = () => {
        message.error('Ошибка записи');
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        try {
          message.loading('Распознаем речь...', 0);
          
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');

          const response = await fetch(`${API_URL}/api/transcribe`, {
            method: 'POST',
            body: formData,
          });

          message.destroy();

          if (!response.ok) {
            throw new Error(`Transcription failed: ${response.status}`);
          }

          const data = await response.json();
          setInputText(data.text);
          message.success('Текст распознан');
        } catch (error) {
          console.error('Transcription error:', error);
          message.error('Не удалось распознать речь');
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error('Error starting recording:', err);
      message.error('Ошибка доступа к микрофону');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      message.info('Запись остановлена');
    }
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
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
          disabled={isLoading || isRecording}
        />
        {isRecording && <AudioWaveform isRecording={isRecording} />}
        <Button
          icon={<BugOutlined />}
          onClick={testMicrophoneAccess}
          type="default"
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