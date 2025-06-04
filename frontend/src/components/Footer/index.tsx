import { type FC } from 'react';
import { Typography } from 'antd';
import { FooterContainer, FooterContent } from './styles';

const { Text } = Typography;

const Footer: FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <Text type="secondary">
          Empathy App ©{new Date().getFullYear()} Created with ❤️
        </Text>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer; 