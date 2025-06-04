import { type FC } from 'react';
import { Card, Typography, Row, Col, Space, Button, Tooltip, message as messageApi } from 'antd';
import {
  HeartOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PlusCircleOutlined,
  MessageOutlined,
  CopyOutlined,
  FilePdfOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import type { Message } from '../types';
import { jsPDF } from 'jspdf';

const { Title, Text, Paragraph } = Typography;

const ResultCard = styled(Card)`
  max-width: 800px;
  width: 100%;
  margin: 24px auto;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden;
`;

const MessageSection = styled.div`
  margin: -24px -24px 24px;
  padding: 24px;
  background: ${({ theme }) => theme.colorBgContainer};
  border-bottom: 1px solid ${({ theme }) => theme.colorBorderSecondary};
`;

const AnalysisSection = styled.div`
  .analysis-card {
    border-radius: 8px;
    transition: all 0.3s ease;
    margin-bottom: 24px;
    border: none;
    background: transparent;
    
    .ant-card-head {
      border-bottom: none;
      padding: 0 0 16px 0;
    }
    
    .ant-card-body {
      padding: 0;
    }
  }

  .section-icon {
    font-size: 24px;
    margin-bottom: 16px;
    color: ${({ theme }) => theme.colorPrimary};
  }

  .analysis-item {
    margin-bottom: 16px;
    padding: 16px;
    background: ${({ theme }) => theme.colorBgElevated};
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.colorBorderSecondary};

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const MessageBlock = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colorFillQuaternary};
  border-radius: ${({ theme }) => theme.borderRadiusLG}px;
  padding: ${({ theme }) => theme.padding * 2}px;
  padding-right: ${({ theme }) => theme.padding * 5}px;
  margin-bottom: ${({ theme }) => theme.margin}px;

  .ant-typography {
    margin-bottom: 0;
  }
`;

const CopyButton = styled(Button)`
  position: absolute;
  top: ${({ theme }) => theme.padding}px;
  right: ${({ theme }) => theme.padding}px;
  opacity: 0.6;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
`;

interface AnalysisResultsProps {
  message: Message;
  onAskAgain?: () => void;
}

const AnalysisResults: FC<AnalysisResultsProps> = ({ message, onAskAgain }) => {
  if (!message.response) return null;

  const { analysis, long_version, short_version } = message.response;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    messageApi.success('Copied to clipboard');
  };

  const handleExportPDF = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });
    
    // Add custom fonts for Cyrillic support
    pdf.addFont('/fonts/Roboto-Regular.ttf', 'Roboto', 'normal');
    pdf.addFont('/fonts/Roboto-Bold.ttf', 'Roboto', 'bold');
    
    const lineHeight = 20;
    let yPos = 40;
    const margin = 40;
    const pageWidth = pdf.internal.pageSize.width;
    const maxWidth = pageWidth - margin * 2;

    // Helper function to clean text for PDF
    const cleanText = (text: string): string => {
      return text
        .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '') // Remove control characters
        .replace(/[\u007F-\u009F]/g, '') // Remove more control characters
        .trim();
    };

    // Helper function to add styled text
    const addStyledText = (text: string, title: string, options: { fontSize?: number; isBold?: boolean; isTitle?: boolean; color?: string } = {}) => {
      const { fontSize = 12, isBold = false, isTitle = false, color = '#000000' } = options;
      
      // Check if we need a new page
      if (yPos > pdf.internal.pageSize.height - 60) {
        pdf.addPage();
        yPos = 40;
      }

      pdf.setFont('Roboto', isBold ? 'bold' : 'normal');
      pdf.setFontSize(fontSize);

      if (isTitle) {
        pdf.setTextColor(color);
        pdf.text(cleanText(title), margin, yPos);
        yPos += lineHeight * 1.5;
        return;
      }

      // Add title
      pdf.setTextColor(color);
      pdf.text(cleanText(title), margin, yPos);
      yPos += lineHeight;

      // Add content with proper encoding and border
      pdf.setTextColor(0, 0, 0);
      const cleanedText = cleanText(text);
      const splitText = pdf.splitTextToSize(cleanedText, maxWidth - 20);
      
      // Draw border
      const textHeight = splitText.length * lineHeight;
      pdf.setDrawColor(217, 217, 217); // Ant Design's border color
      pdf.rect(margin, yPos - 5, maxWidth, textHeight + 20);
      
      // Add text with padding
      pdf.text(splitText, margin + 10, yPos + 10);
      yPos += textHeight + 30;
    };

    try {
      // Title
      addStyledText('', 'Message Analysis Report', { fontSize: 24, isBold: true, isTitle: true, color: '#1677ff' });
      yPos += 20;

      // Original Message
      addStyledText(message.content, 'Your Message:', { fontSize: 14, isBold: true, color: '#1677ff' });

      if (analysis) {
        yPos += 20;
        // Self Awareness
        addStyledText('', 'Self Awareness', { fontSize: 16, isBold: true, isTitle: true, color: '#1677ff' });
        addStyledText(analysis.self_awareness.emotional_background, 'Emotional Background:', { color: '#faad14' });
        addStyledText(analysis.self_awareness.step_back_analysis, 'Step Back Analysis:', { color: '#1890ff' });
        addStyledText(analysis.self_awareness.present_elements, 'Present Elements:', { color: '#52c41a' });
        addStyledText(analysis.self_awareness.missing_elements, 'Missing Elements:', { color: '#ff4d4f' });

        // Self Regulation
        addStyledText('', 'Self Regulation', { fontSize: 16, isBold: true, isTitle: true, color: '#1677ff' });
        addStyledText(analysis.self_regulation.current_phrasing, 'Current Phrasing:', { color: '#722ed1' });
        addStyledText(analysis.self_regulation.improvement_examples, 'Improvement Examples:', { color: '#13c2c2' });
        addStyledText(analysis.self_regulation.alternative_phrases, 'Alternative Phrases:', { color: '#eb2f96' });

        // Empathy
        addStyledText('', 'Empathy', { fontSize: 16, isBold: true, isTitle: true, color: '#1677ff' });
        addStyledText(analysis.empathy.missing_elements, 'Missing Elements:', { color: '#ff4d4f' });
        addStyledText(analysis.empathy.potential_additions, 'Potential Additions:', { color: '#52c41a' });
        addStyledText(analysis.empathy.understanding_examples, 'Understanding Examples:', { color: '#1890ff' });

        // Social Skills
        addStyledText('', 'Social Skills', { fontSize: 16, isBold: true, isTitle: true, color: '#1677ff' });
        addStyledText(analysis.social_skills.current_impact, 'Current Impact:', { color: '#faad14' });
        addStyledText(analysis.social_skills.improvements, 'Improvements:', { color: '#13c2c2' });
        addStyledText(analysis.social_skills.examples, 'Examples:', { color: '#722ed1' });
      }

      // Suggested Message and Short Version
      yPos += 20;
      addStyledText(long_version, 'Suggested Message Text:', { fontSize: 14, isBold: true, color: '#1677ff' });
      addStyledText(short_version, 'Short Version:', { fontSize: 14, isBold: true, color: '#1677ff' });

      // Add footer with date
      const date = new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      pdf.setFont('Roboto', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Generated on ${date}`, margin, pdf.internal.pageSize.height - 20);

      pdf.save('message-analysis.pdf');
      messageApi.success('PDF exported successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      messageApi.error('Failed to generate PDF');
    }
  };

  const renderAnalysisItem = (title: string, content: string, icon: React.ReactNode) => (
    <div className="analysis-item">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          {icon}
          <Text strong>{title}</Text>
        </Space>
        <Paragraph style={{ margin: 0 }}>{content}</Paragraph>
      </Space>
    </div>
  );

  return (
    <ResultCard
      extra={
        <Button 
          icon={<FilePdfOutlined />} 
          onClick={handleExportPDF}
          type="text"
        >
          Export to PDF
        </Button>
      }
    >
      <MessageSection>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={5} style={{ marginBottom: 16, color: '#1677ff' }}>
              <MessageOutlined style={{ marginRight: 8 }} />
              Your Message
            </Title>
            <MessageBlock>
              <Paragraph>{message.content}</Paragraph>
            </MessageBlock>
          </Col>
        </Row>
      </MessageSection>

      {analysis && (
        <AnalysisSection>
          <Card className="analysis-card" title={<><HeartOutlined className="section-icon" style={{ color: '#1677ff' }} /> Self Awareness</>}>
            {renderAnalysisItem(
              'Emotional Background',
              analysis.self_awareness.emotional_background,
              <BulbOutlined style={{ color: '#faad14' }} />
            )}
            {renderAnalysisItem(
              'Step Back Analysis',
              analysis.self_awareness.step_back_analysis,
              <ThunderboltOutlined style={{ color: '#1890ff' }} />
            )}
            {renderAnalysisItem(
              'Present Elements',
              analysis.self_awareness.present_elements,
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
            )}
            {renderAnalysisItem(
              'Missing Elements',
              analysis.self_awareness.missing_elements,
              <WarningOutlined style={{ color: '#ff4d4f' }} />
            )}
          </Card>

          <Card className="analysis-card" title={<><TeamOutlined className="section-icon" style={{ color: '#1677ff' }} /> Self Regulation</>}>
            {renderAnalysisItem(
              'Current Phrasing',
              analysis.self_regulation.current_phrasing,
              <MessageOutlined style={{ color: '#722ed1' }} />
            )}
            {renderAnalysisItem(
              'Improvement Examples',
              analysis.self_regulation.improvement_examples,
              <PlusCircleOutlined style={{ color: '#13c2c2' }} />
            )}
            {renderAnalysisItem(
              'Alternative Phrases',
              analysis.self_regulation.alternative_phrases,
              <BulbOutlined style={{ color: '#eb2f96' }} />
            )}
          </Card>

          <Card className="analysis-card" title={<><HeartOutlined className="section-icon" style={{ color: '#1677ff' }} /> Empathy</>}>
            {renderAnalysisItem(
              'Missing Elements',
              analysis.empathy.missing_elements,
              <WarningOutlined style={{ color: '#ff4d4f' }} />
            )}
            {renderAnalysisItem(
              'Potential Additions',
              analysis.empathy.potential_additions,
              <PlusCircleOutlined style={{ color: '#52c41a' }} />
            )}
            {renderAnalysisItem(
              'Understanding Examples',
              analysis.empathy.understanding_examples,
              <BulbOutlined style={{ color: '#1890ff' }} />
            )}
          </Card>

          <Card className="analysis-card" title={<><TeamOutlined className="section-icon" style={{ color: '#1677ff' }} /> Social Skills</>}>
            {renderAnalysisItem(
              'Current Impact',
              analysis.social_skills.current_impact,
              <ThunderboltOutlined style={{ color: '#faad14' }} />
            )}
            {renderAnalysisItem(
              'Improvements',
              analysis.social_skills.improvements,
              <PlusCircleOutlined style={{ color: '#13c2c2' }} />
            )}
            {renderAnalysisItem(
              'Examples',
              analysis.social_skills.examples,
              <BulbOutlined style={{ color: '#722ed1' }} />
            )}
          </Card>
        </AnalysisSection>
      )}

      <MessageSection>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Title level={5} style={{ marginBottom: 16, color: '#1677ff' }}>
              <CheckCircleOutlined style={{ marginRight: 8 }} />
              Suggested Message Text
            </Title>
            <MessageBlock>
              <Tooltip title="Copy to clipboard">
                <CopyButton 
                  icon={<CopyOutlined />} 
                  size="small"
                  type="text"
                  onClick={() => handleCopy(long_version)}
                />
              </Tooltip>
              <Paragraph>{long_version}</Paragraph>
            </MessageBlock>
          </Col>
          <Col span={24}>
            <Title level={5} style={{ marginBottom: 16, color: '#1677ff' }}>
              <MessageOutlined style={{ marginRight: 8 }} />
              Short Version
            </Title>
            <MessageBlock>
              <Tooltip title="Copy to clipboard">
                <CopyButton 
                  icon={<CopyOutlined />} 
                  size="small"
                  type="text"
                  onClick={() => handleCopy(short_version)}
                />
              </Tooltip>
              <Paragraph>{short_version}</Paragraph>
            </MessageBlock>
          </Col>
        </Row>
      </MessageSection>

      <ActionButtons>
        <Button 
          type="primary" 
          icon={<RedoOutlined />} 
          size="large"
          onClick={onAskAgain}
        >
          Ask Again
        </Button>
      </ActionButtons>
    </ResultCard>
  );
};

export default AnalysisResults; 