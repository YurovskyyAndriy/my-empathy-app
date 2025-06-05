import { Typography, Card, Steps } from 'antd';
import {
  MessageOutlined,
  RobotOutlined,
  HeartOutlined,
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
      <Title>How to Use MyEmpathy</Title>
      <Paragraph>
        Welcome to MyEmpathy! This guide will help you understand how to use
        our platform to enhance the emotional content of your messages.
      </Paragraph>

      <StyledCard>
        <Title level={3}>Getting Started</Title>
        <Steps
          direction="vertical"
          items={[
            {
              title: 'Enter Your Message',
              description: 'Write the text you want to analyze.',
              icon: <MessageOutlined />,
            },
            {
              title: 'Get Analysis',
              description: 'System will analyze emotional content and suggest improvements.',
              icon: <RobotOutlined />,
            },
            {
              title: 'Rate the Result',
              description: 'Rate the response to help improve system quality.',
              icon: <HeartOutlined />,
            },
            {
              title: 'Apply Recommendations',
              description: 'Use the suggested improvements in your message.',
              icon: <CheckCircleOutlined />,
            },
          ]}
        />
      </StyledCard>

      <StyledCard>
        <Title level={3}>Features Overview</Title>
        <Title level={4}>Text Analysis</Title>
        <Paragraph>
          <ul>
            <li>Enter your message in the text field</li>
            <li>System automatically detects the language</li>
            <li>Get detailed emotional content analysis</li>
            <li>Review improvement suggestions</li>
          </ul>
        </Paragraph>

        <Title level={4}>Vector Search</Title>
        <Paragraph>
          <ul>
            <li>System searches for similar messages in the database</li>
            <li>Uses 0.95 similarity threshold for accuracy</li>
            <li>Stores successful responses for future use</li>
          </ul>
        </Paragraph>

        <Title level={4}>Rating System</Title>
        <Paragraph>
          <ul>
            <li>Rate the usefulness of analysis and recommendations</li>
            <li>Like adds +1 to response rating</li>
            <li>Dislike subtracts -1 from rating</li>
            <li>Low-quality responses are automatically removed</li>
          </ul>
        </Paragraph>
      </StyledCard>

      <StyledCard>
        <Title level={3}>Tips for Better Results</Title>
        <Paragraph>
          <ul>
            <li>Write clear and specific messages</li>
            <li>Use complete sentences for better analysis</li>
            <li>Consider the context of communication</li>
            <li>Experiment with different improvement options</li>
            <li>Practice regularly to develop your skills</li>
          </ul>
        </Paragraph>
      </StyledCard>

      <Card>
        <Title level={3}>Need Help?</Title>
        <Paragraph>
          If you have any questions or need assistance, please refer to our
          documentation or contact support.
        </Paragraph>
        <Text type="secondary">
          Remember: Our goal is to help you improve the emotional content of
          your communication and build better relationships through empathetic interaction.
        </Text>
      </Card>
    </>
  );
};

export default Instructions; 