import { type FC } from 'react';
import { ConfigProvider, theme } from 'antd';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import Router from './Router';
import Layout from './components/Layout';
import { createTheme } from './styles/theme';

const App: FC = () => {
  const { defaultAlgorithm } = theme;
  const { token } = theme.useToken();
  
  const themeConfig = {
    token: {
      colorPrimary: theme.defaultSeed.colorPrimary,
      borderRadius: 6,
    },
    algorithm: defaultAlgorithm,
  };

  return (
    <ConfigProvider theme={themeConfig}>
      <ThemeProvider theme={createTheme(token)}>
        <BrowserRouter>
          <Layout>
            <Router />
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default App;