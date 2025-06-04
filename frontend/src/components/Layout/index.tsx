import { type FC, type ReactNode } from 'react';
import { theme } from 'antd';
import { useLocation } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

const { useToken } = theme;

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const { token } = useToken();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const rootStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
    background: token.colorBgContainer,
  };

  const mainStyle = {
    flex: 1,
    width: '100%',
    paddingTop: 64,
    background: token.colorBgContainer,
  };

  const contentStyle = {
    width: '100%',
    maxWidth: isHome ? 1200 : 800,
    margin: '0 auto',
    padding: `${token.padding * 3}px ${token.padding * 2}px`,
  };

  return (
    <div style={rootStyle}>
      <Header />
      <main style={mainStyle}>
        <div style={contentStyle}>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 