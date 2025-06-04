import { type FC, useState } from 'react';
import { Form, Input, Button, Switch, Space, Card } from 'antd';
import { SendOutlined, AudioOutlined } from '@ant-design/icons';
import styled from 'styled-components';

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

  const handleSubmit = ({ message }: { message: string }) => {
    if (message.trim()) {
      onSubmit(message.trim());
      form.resetFields();
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  return (
    <FormCard>
      <Form form={form} onFinish={handleSubmit}>
        <FormContainer>
          <Form.Item
            name="message"
            rules={[{ required: true, message: 'Please enter your message' }]}
          >
            <TextArea
              placeholder="Type your message here..."
              autoSize={{ minRows: 3, maxRows: 6 }}
              disabled={isLoading}
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
    </FormCard>
  );
};

export default MessageInputForm; 