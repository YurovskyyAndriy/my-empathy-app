import { type FC, useState, useRef, type KeyboardEvent } from 'react';
import { Form, Input, Button, Switch, Space, Card, message } from 'antd';
import { SendOutlined, AudioOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { API_URL } from '../config';
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

const SPEECH_SERVICE_URL = 'http://localhost:5005';

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
        
        try {
          const hide = messageApi.loading('Transcribing speech...', 0);
          
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.webm');

          const response = await fetch(`${SPEECH_SERVICE_URL}/transcribe`, {
            method: 'POST',
            body: formData,
          });

          hide();

          if (!response.ok) {
            throw new Error(`Transcription failed: ${response.status}`);
          }

          const data = await response.json();
          form.setFieldsValue({ message: data.text });
          messageApi.success('Speech transcribed successfully');
        } catch (error) {
          console.error('Transcription error:', error);
          messageApi.error('Failed to transcribe speech');
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