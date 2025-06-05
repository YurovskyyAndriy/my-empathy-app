import { type FC, useState, useRef, type KeyboardEvent } from 'react';
import { Form, Input, Button, Switch, Space, Card, message } from 'antd';
import { SendOutlined, AudioOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { API_URL, SPEECH_SERVICE_URL } from '../config';
import AudioWaveform from './AudioWaveform';

const { TextArea } = Input;

const FormCard = styled(Card)`
  max-width: 600px;
  width: 100%;
  margin: 48px auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface MessageInputFormProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  showAnalysis: boolean;
  onToggleAnalysis: (show: boolean) => void;
}

const MessageInputForm: FC<MessageInputFormProps> = ({
  onSubmit,
  isLoading = false,
  showAnalysis,
  onToggleAnalysis,
}) => {
  const [form] = Form.useForm();
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = ({ message }: { message: string }) => {
    if (message.trim()) {
      onSubmit(message.trim());
      form.resetFields();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstart = () => {
        setIsRecording(true);
        messageApi.info('Recording started...');
      };

      recorder.onerror = () => {
        messageApi.error('Recording error');
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        let hideMessage: (() => void) | undefined;
        
        try {
          // Show initial loading message
          hideMessage = messageApi.loading({
            content: 'Preparing audio for transcription...',
            duration: 0
          });
          
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');

          // Update loading message
          hideMessage();
          hideMessage = messageApi.loading({
            content: 'Transcribing speech (this may take up to 30 seconds)...',
            duration: 0
          });

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 45000); // Increased timeout to 45 seconds

          const response = await fetch(`${SPEECH_SERVICE_URL}/transcribe`, {
            method: 'POST',
            body: formData,
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          hideMessage();

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || `Transcription failed: ${response.status}`);
          }

          const data = await response.json();
          if (!data.text) {
            throw new Error('No transcription text received');
          }
          
          form.setFieldsValue({ message: data.text });
          messageApi.success('Speech transcribed successfully');
        } catch (error: unknown) {
          console.error('Transcription error:', error);
          hideMessage?.();
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              messageApi.error('Transcription timed out. Please try again with a shorter recording (max 30 seconds).');
            } else {
              messageApi.error(`Failed to transcribe speech: ${error.message}`);
            }
          } else {
            messageApi.error('Failed to transcribe speech: Unknown error');
          }
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.error('Error starting recording:', err);
      messageApi.error('Microphone access error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      messageApi.info('Recording stopped');
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
      form.submit();
    }
  };

  return (
    <Card>
      {contextHolder}
      <Form form={form} onFinish={handleSubmit}>
        <FormContainer>
          <Form.Item
            name="message"
            rules={[{ required: true, message: 'Please enter your message' }]}
          >
            <TextArea
              placeholder="Type your message here..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              disabled={isLoading || isRecording}
              onKeyPress={handleKeyPress}
            />
          </Form.Item>

          <ControlsContainer>
            <Space>
              <Switch
                checked={showAnalysis}
                onChange={onToggleAnalysis}
                checkedChildren="Analysis On"
                unCheckedChildren="Analysis Off"
              />
            </Space>
            
            <Space>
              {isRecording && <AudioWaveform isRecording={isRecording} />}
              <Button
                icon={<AudioOutlined />}
                onClick={handleVoiceRecord}
                type={isRecording ? 'primary' : 'default'}
                disabled={isLoading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                htmlType="submit"
                loading={isLoading}
              >
                Send
              </Button>
            </Space>
          </ControlsContainer>
        </FormContainer>
      </Form>
    </Card>
  );
};

export default MessageInputForm; 