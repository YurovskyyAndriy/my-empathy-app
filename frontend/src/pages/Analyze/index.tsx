import { type FC, useState, type ChangeEvent } from 'react';
import { Typography, Input, Button, Space, Card } from 'antd';
import styled from 'styled-components';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
`;

const StyledCard = styled(Card)`
  margin-top: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const AnalyzePage: FC = () => {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleAnalyze = async () => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing text:', error);
    }
  };

  return (
    <PageContainer>
      <Title level={2}>Analyze Your Message</Title>
      <Paragraph type="secondary">
        Enter your message below to receive an emotional analysis and suggestions for improvement.
      </Paragraph>

      <TextArea
        rows={6}
        value={text}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
        placeholder="Type your message here..."
      />

      <Space style={{ marginTop: 16 }}>
        <Button type="primary" onClick={handleAnalyze}>
          Analyze
        </Button>
        <Button onClick={() => setText('')}>
          Clear
        </Button>
      </Space>

      {analysis && (
        <StyledCard>
          <Title level={4}>Analysis Results</Title>
          <Paragraph>{analysis}</Paragraph>
        </StyledCard>
      )}
    </PageContainer>
  );
};

export default AnalyzePage; 