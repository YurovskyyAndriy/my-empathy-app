import { theme } from 'antd';
import { createTheme } from '../styles/theme';

export const useAppTheme = () => {
  const { token } = theme.useToken();
  return createTheme(token);
}; 