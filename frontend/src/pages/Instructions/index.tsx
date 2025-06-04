import { Typography, Card, Steps } from 'antd';
import {
  MessageOutlined,
  AudioOutlined,
  SmileOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const { Title, Paragraph, Text } = Typography;

const StyledCard = styled(Card)`
  margin-bottom: 24px;
`;

const Instructions = () => {
  return (
    <>
      <Title>How to Use the Empathy App</Title>
      <Paragraph>
        Welcome to the Empathy App! This guide will help you understand how to use
        our platform effectively to improve your communication skills.
      </Paragraph>

      <StyledCard>
        <Title level={3}>Getting Started</Title>
        <Steps
          direction="vertical"
          items={[
            {
              title: 'Navigate to Analyze',
              description: 'Click on the "Analyze" tab in the navigation menu.',
              icon: <MessageOutlined />,
            },
            {
              title: 'Choose Input Method',
              description: 'You can either type your message or use voice recording.',
              icon: <AudioOutlined />,
            },
            {
              title: 'Receive Analysis',
              description: 'Get instant feedback on the emotional content of your message.',
              icon: <SmileOutlined />,
            },
            {
              title: 'Apply Suggestions',
              description: 'Use the provided suggestions to improve your communication.',
              icon: <CheckCircleOutlined />,
            },
          ]}
        />
      </StyledCard>

      <StyledCard>
        <Title level={3}>Features Overview</Title>
        <Title level={4}>Text Input</Title>
        <Paragraph>
          <ul>
            <li>Type your message in the text area</li>
            <li>Press Enter to send (Shift + Enter for new line)</li>
            <li>Receive instant analysis and suggestions</li>
          </ul>
        </Paragraph>

        <Title level={4}>Voice Input</Title>
        <Paragraph>
          <ul>
            <li>Click the microphone icon to start recording</li>
            <li>Speak clearly into your microphone</li>
            <li>Click again to stop recording</li>
            <li>Your message will be transcribed and analyzed</li>
          </ul>
        </Paragraph>

        <Title level={4}>Analysis Mode</Title>
        <Paragraph>
          <ul>
            <li>Toggle "Show Analysis" to view detailed emotional analysis</li>
            <li>Understand the emotional impact of your messages</li>
            <li>Get suggestions for more empathetic communication</li>
          </ul>
        </Paragraph>
      </StyledCard>

      <StyledCard>
        <Title level={3}>Tips for Better Results</Title>
        <Paragraph>
          <ul>
            <li>Be clear and specific in your messages</li>
            <li>Use complete sentences for better analysis</li>
            <li>Consider the context of your communication</li>
            <li>Review the analysis and suggestions carefully</li>
            <li>Practice regularly to improve your skills</li>
          </ul>
        </Paragraph>
      </StyledCard>

      <Card>
        <Title level={3}>Need Help?</Title>
        <Paragraph>
          If you have any questions or need assistance, please refer to our
          documentation or contact our support team.
        </Paragraph>
        <Text type="secondary">
          Remember: The goal is to improve your communication skills and build
          better relationships through empathetic interaction.
        </Text>
      </Card>
    </>
  );
};

export default Instructions; 