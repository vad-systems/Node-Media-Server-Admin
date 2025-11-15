import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import React, { useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router';
import { useLocalStorage } from 'usehooks-ts';
import pkg from '../package.json';
import AppMenu from './AppMenu.js';
import Config from './Config.js';
import Dashboard from './Dashboard.js';
import Profile from './Profile.js';
import Streams from './Streams.js';

import './App.css';

const { Header, Sider, Content, Footer } = Layout;

const App = ({ title = 'NodeMediaServer', shortTitle = 'NMS' }) => {
    const [collapsed, setCollapsed] = useLocalStorage('nms.admin.menu.collapsed', false);

    const toggle = useCallback(() => {
        setCollapsed(!collapsed);
    }, [collapsed]);
    return (
        <Router>
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    width={256}
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                >

                    <div className="logo"><h1>{collapsed ? shortTitle : title}</h1></div>

                    <AppMenu />
                </Sider>
                <Layout>
                    <Header style={{ background: '#fff', padding: 0 }}>
                        {
                            collapsed
                                ? <MenuUnfoldOutlined className={'trigger'} onClick={toggle} />
                                : <MenuFoldOutlined className={'trigger'} onClick={toggle} />
                        }
                    </Header>
                    <Content
                        style={{
                            margin: '24px 16px', minHeight: 280, overflowX: 'auto',
                        }}
                    >
                        <Routes>
                            <Route path="/admin" Component={Dashboard} />
                            <Route path="/admin/streams" Component={Streams} />
                            <Route path="/admin/profile" Component={Profile} />
                            <Route path="/admin/config" Component={Config} />
                        </Routes>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                        <a
                            href={'https://github.com/vad-systems/Node-Media-Server'}
                            target={'_blank'}
                            rel={'nofollow'}
                        >Node-Media-Server</a> Admin {pkg.version} | based on <a
                        href={'https://github.com/illuspas/Node-Media-Server/tree/v2'}
                        target={'_blank'}
                        rel={'nofollow'}
                    >Node-Media-Server v2</a>
                    </Footer>
                </Layout>
            </Layout>
        </Router>
    );
};

export default App;
