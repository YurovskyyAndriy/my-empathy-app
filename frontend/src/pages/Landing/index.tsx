import { type FC } from 'react';
import { Typography, Row, Col, Button, Space, Card, theme } from 'antd';
import { Link } from 'react-router-dom';
import {
  MessageOutlined,
  ReadOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { useToken } = theme;

const Landing: FC = () => {
  const { token } = useToken();
  
  const features = [
    {
      icon: <MessageOutlined style={{ fontSize: token.fontSizeHeading3, color: token.colorPrimary }} />,
      title: 'Real-time Analysis',
      description: 'Get instant feedback on the emotional content of your messages.',
    },
    {
      icon: <ReadOutlined style={{ fontSize: token.fontSizeHeading3, color: token.colorPrimary }} />,
      title: 'Learning Resources',
      description: 'Access comprehensive guides on empathetic communication.',
    },
    {
      icon: <TeamOutlined style={{ fontSize: token.fontSizeHeading3, color: token.colorPrimary }} />,
      title: 'Community Support',
      description: 'Join a community dedicated to improving communication skills.',
    },
  ];

  return (
    <Row style={{ padding: token.padding * 3, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <Col span={24} style={{ textAlign: 'center', marginBottom: token.margin * 6 }}>
        <Title>Welcome to Empathy App</Title>
        <Paragraph type="secondary" style={{ marginBottom: token.marginLG }}>
          Enhance your communication with AI-powered emotional intelligence.
          Our app helps you understand and improve the emotional impact of your messages.
        </Paragraph>
        <Space size="large">
          <Link to="/analyze">
            <Button type="primary" size="large">
              <Link to="/analyze">Start Analysis</Link>
            </Button>
          </Link>
          <Link to="/instructions">
            <Button size="large">Learn More</Button>
          </Link>
        </Space>
      </Col>
      
      <Row gutter={[24, 24]}>
        {features.map((feature, index) => (
          <Col key={index} xs={24} sm={8}>
            <Card
              style={{
                height: '100%',
                textAlign: 'center',
                boxShadow: token.boxShadowSecondary,
              }}
              bodyStyle={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: token.padding * 3,
              }}
            >
              <div>{feature.icon}</div>
              <Title level={3}>{feature.title}</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                {feature.description}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </Row>
  );
};

export default Landing; 