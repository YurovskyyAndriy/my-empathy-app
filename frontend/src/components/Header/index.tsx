import { type FC } from 'react';
import { Layout, Menu, Typography, theme } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Title } = Typography;
const { useToken } = theme;

const Header: FC = () => {
  const { token } = useToken();
  const location = useLocation();

  const headerStyle = {
    background: token.colorBgContainer,
    padding: 0,
    boxShadow: token.boxShadowSecondary,
    position: 'fixed',
    width: '100%',
    zIndex: 100,
  } as const;

  const innerStyle = {
    maxWidth: 800,
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${token.padding * 2}px`,
  } as const;

  const logoStyle = {
    padding: `0 ${token.padding * 2}px`,
    display: 'flex',
    alignItems: 'center',
  } as const;

  const menuStyle = {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    border: 'none',
    background: 'none',
  } as const;

  const menuItems = [
    { key: 'home', label: 'Home', path: '/' },
    { key: 'analyze', label: 'Analyze', path: '/analyze' },
    { key: 'instructions', label: 'Instructions', path: '/instructions' },
  ];

  return (
    <AntHeader style={headerStyle}>
      <div style={innerStyle}>
        <div style={logoStyle}>
          <Link to="/">
            <Title level={4} style={{ margin: 0 }}>Empathy App</Title>
          </Link>
        </div>
        <Menu 
          mode="horizontal" 
          selectedKeys={[location.pathname.slice(1) || 'home']} 
          style={menuStyle}
        >
          {menuItems.map(item => (
            <Menu.Item key={item.key}>
              <Link to={item.path}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
      </div>
    </AntHeader>
  );
};

export default Header; 