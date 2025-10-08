import { DashboardOutlined, ProfileOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import React from 'react';
import { useLocation, useNavigate } from 'react-router';

const AppMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/admin',
            label: 'Dashboard',
            onClick: () => navigate('/admin', { replace: true }),
            icon: <DashboardOutlined />,
        },
        {
            key: '/admin/streams',
            label: 'Streams',
            onClick: () => navigate('/admin/streams', { replace: true }),
            icon: <VideoCameraOutlined />,
        },
        {
            key: '/admin/profile',
            onClick: () => navigate('/admin/profile', { replace: true }),
            label: 'Profile',
            icon: <ProfileOutlined />,
        },
    ];

    return (
        <Menu
            theme="dark"
            mode="inline"
            items={menuItems}
            selectedKeys={[location.pathname.replace(/\/$/, '')]}
        />
    );
};

export default AppMenu;
