import { blue, grey } from '@ant-design/colors';
import { type GlobalToken } from 'antd/es/theme';
import { type DefaultTheme } from 'styled-components';

export const colors = {
  // Primary color - Daybreak Blue
  primary: blue[5],
  text: {
    primary: grey[9],
    secondary: grey[7],
    disabled: grey[5],
  },
  background: {
    light: '#ffffff',
    grey: grey[1],
    base: blue[1],
  },
  border: grey[3],
  shadow: grey[2],
  // Additional Ant Design palette colors
  blue: {
    light: blue[1],
    hover: blue[4],
    default: blue[5],
    active: blue[6],
  },
  grey: {
    light: grey[1],
    border: grey[3],
    text: grey[7],
    dark: grey[8],
  }
};

export const layout = {
  maxWidth: '800px',
  headerHeight: '64px',
  footerHeight: '56px',
  borderRadius: '8px',
  boxShadow: `0 2px 8px ${grey[2]}`,
};

export const zIndex = {
  header: 100,
  footer: 100,
  modal: 1000,
  tooltip: 1070,
  popover: 1080,
};

const theme = {
  colors,
  layout,
  zIndex,
};

export default theme;

export const createTheme = (token: GlobalToken): DefaultTheme => ({
  ...token,
  headerHeight: 64,
  contentMaxWidth: 800,
  contentMaxWidthLarge: 1200,
  contentPadding: token.padding * 3,
  contentGap: token.padding * 3,
  contentGapLarge: token.padding * 6,
} as DefaultTheme); 