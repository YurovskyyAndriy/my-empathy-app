import { type FC, useState } from 'react';
import { Form, Input, Button, Card, Space, Typography } from 'antd';
import styled from 'styled-components';
import { SendOutlined } from '../styles/icons';
import AudioRecorder from './AudioRecorder';

const { TextArea } = Input;
const { Text } = Typography;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const ResultText = styled(Text)`
  white-space: pre-wrap;
`;

interface MessageFormProps {
  onSubmit?: (text: string) => void;
}

const MessageForm: FC<MessageFormProps> = ({ onSubmit }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (values: { message: string }) => {
    if (!values.message.trim()) return;

    setLoading(true);
    try {
      // Here would be your API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResult('This is a simulated analysis result.');
      if (onSubmit) {
        onSubmit(values.message);
      }
      form.resetFields();
    } finally {
      setLoading(false);
    }
  };

  const handleAudioTranscription = (text: string) => {
    form.setFieldsValue({ message: text });
  };

  return (
    <FormContainer>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="message"
          rules={[{ required: true, message: 'Please enter your message' }]}
        >
          <TextArea
            placeholder="Type your message here..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            disabled={loading}
          />
        </Form.Item>

        <Space>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SendOutlined />}
            loading={loading}
          >
            Analyze
          </Button>
          <AudioRecorder onTranscription={handleAudioTranscription} />
        </Space>
      </Form>

      {result && (
        <StyledCard title="Analysis Result" size="small">
          <ResultText>{result}</ResultText>
        </StyledCard>
      )}
    </FormContainer>
  );
};

export default MessageForm;
