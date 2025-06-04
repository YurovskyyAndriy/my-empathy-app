import { type FC } from 'react';
import { Typography, Space, Card, List } from 'antd';
import styled from 'styled-components';
import {
  FileTextOutlined,
  ReadOutlined,
  YoutubeOutlined,
  TeamOutlined,
} from '../../styles/icons';

const { Title, Paragraph, Link } = Typography;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
`;

const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StyledCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .ant-card-body {
    padding: 24px;
  }
`;

const Materials: FC = () => {
  const presentationMaterials = [
    {
      icon: <FileTextOutlined />,
      title: 'Project Presentation',
      description: 'Overview of the Empathy App project and its goals.',
      link: '#',
    },
    {
      icon: <YoutubeOutlined />,
      title: 'Demo Video',
      description: 'Watch a demonstration of the app in action.',
      link: '#',
    },
  ];

  const technicalResources = [
    {
      icon: <ReadOutlined />,
      title: 'Technical Documentation',
      description: 'Detailed technical documentation and API references.',
      link: '#',
    },
    {
      icon: <FileTextOutlined />,
      title: 'Implementation Guide',
      description: 'Step-by-step guide for implementing the app.',
      link: '#',
    },
  ];

  const researchMaterials = [
    {
      icon: <ReadOutlined />,
      title: 'Research Papers',
      description: 'Academic research behind our approach.',
      link: '#',
    },
    {
      icon: <FileTextOutlined />,
      title: 'Case Studies',
      description: 'Real-world examples and outcomes.',
      link: '#',
    },
  ];

  const connectLinks = [
    {
      icon: <TeamOutlined />,
      title: 'Join Our Community',
      description: 'Connect with other users and share experiences.',
      link: '#',
    },
    {
      icon: <TeamOutlined />,
      title: 'Contact Support',
      description: 'Get help with any questions or issues.',
      link: '#',
    },
  ];

  const renderSection = (title: string, items: any[]) => (
    <SectionWrapper>
      <Title level={3}>{title}</Title>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={items}
        renderItem={item => (
          <List.Item>
            <StyledCard>
              <Space direction="vertical" size={16}>
                <Space size={16}>
                  {item.icon}
                  <Title level={4} style={{ margin: 0 }}>{item.title}</Title>
                </Space>
                <Paragraph type="secondary">{item.description}</Paragraph>
                <Link href={item.link}>Learn more</Link>
              </Space>
            </StyledCard>
          </List.Item>
        )}
      />
    </SectionWrapper>
  );

  return (
    <ContentWrapper>
      <div>
        <Title>Project Materials</Title>
        <Paragraph type="secondary">
          Access all the resources and materials related to the Empathy App project.
          From technical documentation to research papers, everything you need is here.
        </Paragraph>
      </div>

      {renderSection('Presentation Materials', presentationMaterials)}
      {renderSection('Technical Resources', technicalResources)}
      {renderSection('Research and Background', researchMaterials)}
      {renderSection('Connect With Us', connectLinks)}
    </ContentWrapper>
  );
};

export default Materials; 