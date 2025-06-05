import { type FC } from 'react';
import { Typography, Row, Col, Button, Space, Card, theme } from 'antd';
import { Link } from 'react-router-dom';
import {
  MessageOutlined,
  RobotOutlined,
  HeartOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { useToken } = theme;

const Landing: FC = () => {
  const { token } = useToken();
  
  const features = [
    {
      icon: <MessageOutlined style={{ fontSize: token.fontSizeHeading3, color: token.colorPrimary }} />,
      title: 'Emotional Analysis',
      description: 'Analyze and enhance the emotional content of your messages using AI.',
    },
    {
      icon: <RobotOutlined style={{ fontSize: token.fontSizeHeading3, color: token.colorPrimary }} />,
      title: 'Vector Search',
      description: 'Smart similar message search for fast and relevant responses.',
    },
    {
      icon: <HeartOutlined style={{ fontSize: token.fontSizeHeading3, color: token.colorPrimary }} />,
      title: 'Feedback System',
      description: 'Rating and feedback system for continuous response quality improvement.',
    },
  ];

  return (
    <Row style={{ padding: token.padding * 3, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <Col span={24} style={{ textAlign: 'center', marginBottom: token.margin * 6 }}>
        <Title>MyEmpathy</Title>
        <Paragraph type="secondary" style={{ marginBottom: token.marginLG }}>
          An innovative system for enhancing the emotional content of messages.
          Harness the power of AI to create more empathetic communication.
        </Paragraph>
        <Space size="large">
          <Link to="/analyze">
            <Button type="primary" size="large">
              Start Analysis
            </Button>
          </Link>
          <Link to="/instructions">
            <Button size="large">Instructions</Button>
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