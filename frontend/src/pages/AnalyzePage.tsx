import { type FC } from 'react';
import { Typography, Card } from 'antd';
import styled from 'styled-components';
import MessageForm from '../components/MessageForm';

const { Title, Paragraph } = Typography;

const PageContainer = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const AnalyzePage: FC = () => {
  return (
    <PageContainer>
      <ContentWrapper>
        <div>
          <Title level={2}>Analyze Your Message</Title>
          <Paragraph type="secondary">
            Enter your message below to analyze its emotional content and get suggestions
            for more empathetic communication.
          </Paragraph>
        </div>
        <StyledCard>
          <MessageForm />
        </StyledCard>
      </ContentWrapper>
    </PageContainer>
  );
};

export default AnalyzePage;