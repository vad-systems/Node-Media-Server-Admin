import { CarryOutOutlined, DashboardOutlined, ProfileOutlined, SettingOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from './context/LanguageContext';

const AppMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const menuItems = [
        {
            key: '/admin',
            label: t('dashboard'),
            onClick: () => navigate('/admin', { replace: true }),
            icon: <DashboardOutlined />,
        },
        {
            key: '/admin/streams',
            label: t('streams'),
            onClick: () => navigate('/admin/streams', { replace: true }),
            icon: <VideoCameraOutlined />,
        },
        {
            key: '/admin/tasks',
            label: t('tasks'),
            onClick: () => navigate('/admin/tasks', { replace: true }),
            icon: <CarryOutOutlined />,
        },
        {
            key: '/admin/profile',
            onClick: () => navigate('/admin/profile', { replace: true }),
            label: t('profile'),
            icon: <ProfileOutlined />,
        },
        {
            key: '/admin/config',
            onClick: () => navigate('/admin/config', { replace: true }),
            label: t('config'),
            icon: <SettingOutlined />,
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
