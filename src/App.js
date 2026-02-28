import React, { Component } from 'react';
import { BrowserRouter as Router, Link, Route } from "react-router-dom";
import { Layout, Menu } from 'antd';
import {
    DashboardOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ProfileOutlined,
    VideoCameraOutlined
} from '@ant-design/icons';
import { createBrowserHistory } from 'history';
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Streams from "./Streams";

import "./App.css"


const { Header, Sider, Content, Footer } = Layout;

class App extends Component {

    fullTitle = "NodeMediaServer";

    shortTitle = "NMS";

    state = {
        collapsed: false,
        title: this.fullTitle,
        pathname: "/"
    };

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
            title: this.state.collapsed ? this.fullTitle : this.shortTitle,
        });
    }

    componentWillReceiveProps(nextProps, nextContext) {
        console.log(nextProps, nextContext);
    }

    render() {
        return (
            <Router>
                <Layout style={{ minHeight: "100vh" }}>
                    <Sider
                        width={256}
                        trigger={null}
                        collapsible
                        collapsed={this.state.collapsed}>

                        <div className="logo"><h1>{this.state.title}</h1></div>

                        <Menu theme="dark" mode="inline"
                            defaultSelectedKeys={[createBrowserHistory().location.pathname]}
                        >
                            <Menu.Item key="/admin/">
                                <Link to="/admin/">
                                    <DashboardOutlined />
                                    <span>Dashboard</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="/admin/streams">
                                <Link to="/admin/streams">
                                    <VideoCameraOutlined />
                                    <span>Streams</span>
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="/admin/profile">
                                <Link to="/admin/profile">
                                    <ProfileOutlined />
                                    <span>Profile</span>
                                </Link>
                            </Menu.Item>
                        </Menu>
                    </Sider>
                    <Layout>
                        <Header style={{ background: '#fff', padding: 0 }}>
                            {
                                this.state.collapsed
                                  ? <MenuUnfoldOutlined className={"trigger"} onClick={this.toggle} />
                                  : <MenuFoldOutlined className="trigger" onClick={this.toggle} />
                            }
                        </Header>
                        <Content style={{
                            margin: '24px 16px', minHeight: 280, overflowX: 'auto',
                        }}>
                            <Route exact path="/admin" component={Dashboard} />
                            <Route path="/admin/streams" component={Streams} />
                            <Route path="/admin/profile" component={Profile} />
                        </Content>
                        <Footer style={{ textAlign: 'center' }}>
                            Node-Media-Server ©2019 Created by <a href="http://nodemedia.cn" rel="noopener noreferrer" target="_blank">NodeMedia</a>.
                        </Footer>
                    </Layout>
                </Layout>


            </Router>
        );
    }

}

export default App;
