import { BulbOutlined, BulbFilled, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Layout, App as AntApp, Flex, Typography, ConfigProvider, theme, Switch, Space, Select } from 'antd';
import React, { useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import { useLocalStorage } from 'usehooks-ts';
import pkg from '../package.json';
import { useTranslation } from './context/LanguageContext';
import AppMenu from './AppMenu';
import Config from './Config';
import Dashboard from './Dashboard';
import Profile from './Profile';
import Streams from './Streams';
import Tasks from './Tasks';

import './App.css';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;
const { defaultAlgorithm, darkAlgorithm } = theme;

const App = ({ title = 'NodeMediaServer', shortTitle = 'NMS' }) => {
    const [collapsed, setCollapsed] = useLocalStorage('nms.admin.menu.collapsed', false);
    const [isDarkMode, setIsDarkMode] = useLocalStorage('nms.admin.theme.dark', false);
    const { locale, setLocale, t } = useTranslation();

    const toggle = useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed]);

    const toggleTheme = useCallback((checked: boolean) => {
        setIsDarkMode(checked);
    }, [setIsDarkMode]);

    return (
        <Router>
            <ConfigProvider theme={{ algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm }}>
                <AntApp>
                <Layout className={isDarkMode ? 'nms-dark' : undefined} style={{ minHeight: '100vh' }}>
                    <Sider
                        width={256}
                        trigger={null}
                        collapsible
                        collapsed={collapsed}
                        breakpoint="lg"
                        onCollapse={(c) => setCollapsed(c)}
                    >
                        <div className="logo"><h1>{collapsed ? shortTitle : title}</h1></div>
                        <AppMenu />
                    </Sider>
                    <Layout>
                        <Header style={{ background: isDarkMode ? '#141414' : '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                {
                                    collapsed
                                        ? <MenuUnfoldOutlined className={'trigger'} onClick={toggle} />
                                        : <MenuFoldOutlined className={'trigger'} onClick={toggle} />
                                }
                            </div>
                            <Space size="large">
                                <Select
                                    value={locale}
                                    onChange={(val) => setLocale(val as any)}
                                    options={[
                                        { value: 'en', label: 'English' },
                                        { value: 'de', label: 'Deutsch' },
                                    ]}
                                    size="middle"
                                    variant="borderless"
                                />
                                <Switch
                                    checkedChildren={<BulbFilled />}
                                    unCheckedChildren={<BulbOutlined />}
                                    checked={isDarkMode}
                                    onChange={toggleTheme}
                                />
                            </Space>
                        </Header>
                    <Content
                        style={{
                            margin: '24px 16px', minHeight: 280, overflowX: 'auto',
                        }}
                    >
                        <Routes>
                            <Route path="/admin" Component={Dashboard} />
                            <Route path="/admin/streams" Component={Streams} />
                            <Route path="/admin/tasks" Component={Tasks} />
                            <Route path="/admin/profile" Component={Profile} />
                            <Route path="/admin/config" Component={Config} />
                        </Routes>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                        <Flex justify="center" align="center" gap="small" wrap>
                            <a
                                href={'https://github.com/vad-systems/Node-Media-Server'}
                                target={'_blank'}
                                rel={'nofollow'}
                            >Node-Media-Server</a>
                            <Text type="secondary">Admin {pkg.version}</Text>
                            <Text type="secondary">|</Text>
                            <Text type="secondary">{t('based_on')}</Text>
                            <a
                            href={'https://github.com/illuspas/Node-Media-Server/tree/v2'}
                            target={'_blank'}
                            rel={'nofollow'}
                        >Node-Media-Server v2</a>
                        </Flex>
                    </Footer>
                    </Layout>
                    </Layout>
                </AntApp>
            </ConfigProvider>
        </Router>
    );
};

export default App;
