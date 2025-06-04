import styled from 'styled-components';
import theme from '../../styles/theme';

export const FooterContainer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${theme.layout.footerHeight};
  background: ${theme.colors.background.light};
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.footer};
`;

export const FooterContent = styled.div`
  max-width: ${theme.layout.maxWidth};
  width: 100%;
  margin: 0 auto;
  text-align: center;
`; 