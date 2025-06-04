import styled from 'styled-components';
import { Layout } from 'antd';
import theme from '../../styles/theme';

const { Header: AntHeader } = Layout;

export const HeaderContainer = styled(AntHeader)`
  display: flex;
  align-items: center;
  background: ${theme.colors.background.light};
  padding: 0;
  box-shadow: ${theme.layout.boxShadow};
  position: fixed;
  width: 100%;
  z-index: ${theme.zIndex.header};
  top: 0;
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: ${theme.layout.maxWidth};
  margin: 0 auto;
  justify-content: center;
`;

export const Logo = styled.div`
  color: ${theme.colors.primary};
  white-space: nowrap;
`; 