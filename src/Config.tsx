import { CloudUploadOutlined, InteractionOutlined, NodeIndexOutlined, PartitionOutlined, SettingOutlined } from '@ant-design/icons';
import { Card, Col, Flex, Row, Switch } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

type HttpConfig = {
    readonly mediaroot?: string;
    readonly port?: number;
    readonly allow_origin?: string;
    readonly api?: boolean;
};

type HttpsConfig = {
    readonly port?: number;
};

type RtmpConfig = {
    readonly port?: number;
    readonly chunk_size?: number;
    readonly ping?: number;
    readonly ping_timeout?: number;
    readonly gop_cache?: boolean;
};

type TransConfig = {
    readonly ffmpeg: string;
    readonly tasks: object[];
};

type RelayConfig = {
    readonly ffmpeg: string;
    readonly tasks: object[];
};

type FissionConfig = {
    readonly ffmpeg: string;
    readonly tasks: object[];
};

type ConfigData = {
    http: HttpConfig,
    https: HttpsConfig,
    rtmp?: RtmpConfig,
    trans?: TransConfig,
    relay?: RelayConfig,
    fission?: FissionConfig,
};

const HttpConfig = ({ http, https }: { http: HttpConfig, https: HttpsConfig }) => {
    const title = (
        <Flex justify={'flex-start'} align={'center'} gap={'small'}>
            <SettingOutlined />
            <Switch
                checked={!!(
                    https || http
                )}
                disabled
            />
            <span style={{ paddingLeft: '12px', fontSize: '16px' }}>HTTP/S Config</span>
        </Flex>
    );

    return (
        <Card title={title} style={{ height: '100%' }}>
            <pre>{JSON.stringify(http, undefined, 2)}</pre>
            <pre>{JSON.stringify(https, undefined, 2)}</pre>
        </Card>
    );
};

const RtmpConfig = ({ rtmp }: { rtmp?: RtmpConfig }) => {
    const title = (
        <Flex justify={'flex-start'} align={'center'} gap={'small'}>
            <CloudUploadOutlined />
            <Switch
                checked={!!rtmp}
                disabled
            />
            <span style={{ paddingLeft: '12px', fontSize: '16px' }}>RTMP Config</span>
        </Flex>
    );

    return (
        <Card title={title} style={{ height: '100%' }}>
            <pre>{JSON.stringify(rtmp, undefined, 2)}</pre>
        </Card>
    );
};

const TransConfig = ({ trans }: { trans?: TransConfig }) => {
    const title = (
        <Flex justify={'flex-start'} align={'center'} gap={'small'}>
            <PartitionOutlined />
            <Switch
                checked={!!trans}
                disabled
            />
            <span style={{ paddingLeft: '12px', fontSize: '16px' }}>Trans Config</span>
        </Flex>
    );

    return (
        <Card title={title} style={{ height: '100%' }}>
            <pre>{JSON.stringify(trans, undefined, 2)}</pre>
        </Card>
    );
};

const RelayConfig = ({ relay }: { relay?: RelayConfig }) => {
    const title = (
        <Flex justify={'flex-start'} align={'center'} gap={'small'}>
            <NodeIndexOutlined />
            <Switch
                checked={!!relay}
                disabled
            />
            <span style={{ paddingLeft: '12px', fontSize: '16px' }}>Relay Config</span>
        </Flex>
    );

    return (
        <Card title={title} style={{ height: '100%' }}>
            <pre>{JSON.stringify(relay, undefined, 2)}</pre>
        </Card>
    );
};

const FissionConfig = ({ fission }: { fission?: FissionConfig }) => {
    const title = (
        <Flex justify={'flex-start'} align={'center'} gap={'small'}>
            <InteractionOutlined />
            <Switch
                checked={!!fission}
                disabled
            />
            <span style={{ paddingLeft: '12px', fontSize: '16px' }}>Fission Config</span>
        </Flex>
    );

    return (
        <Card title={title} style={{ height: '100%' }}>
            <pre>{JSON.stringify(fission, undefined, 2)}</pre>
        </Card>
    );
};

const Config = () => {
    const [config, setConfig] = useState<ConfigData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(() => {
        setLoading(true);

        fetch('/api/server/config', { credentials: 'include' })
            .then((response) => response.json())
            .then((data) => {
                setLoading(false);
                setConfig(data);
            })
            .catch(e => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return config && (
        <Row style={{ margin: '0 -12px' }} gutter={[16, 16]} wrap>
            <Col span={24} style={{ alignSelf: 'stretch' }}>
                <HttpConfig http={config.http} https={config.https} />
            </Col>
            <Col span={24} style={{ alignSelf: 'stretch' }}>
                <RtmpConfig rtmp={config.rtmp} />
            </Col>
            <Col span={8} style={{ alignSelf: 'stretch' }}>
                <TransConfig trans={config.trans} />
            </Col>
            <Col span={8} style={{ alignSelf: 'stretch' }}>
                <RelayConfig relay={config.relay} />
            </Col>
            <Col span={8} style={{ alignSelf: 'stretch' }}>
                <FissionConfig fission={config.fission} />
            </Col>
        </Row>
    );
};

export default Config;
