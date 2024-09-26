import React, { useState, useEffect } from "react";
import { Button, Row, Col, Space, Table, Typography, Menu, Dropdown, Card, Spin, notification, Input } from "antd";
import { SyncOutlined, UserAddOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons";
import NewJornada from "../../components/NewJornada.js";

const Jornada = () => {
    const { Title } = Typography;
    const [loading, setLoading] = useState(true);
    const [mensajeLoading, setMensajeLoading] = useState("cargando...");
    const [jornadaData, setJornada] = useState([]);
    const [isOpeNewJornada, setIsOpenNewModal] = useState(false);
    const [isOpeUpdateJornada, setIsOpenUpdateModal] = useState(false);
    const [formularioEditar, setFormularioEditar] = useState([]);
    const [filterJornada, setFilterJornada] = useState(""); // Nuevo estado para el filtro
    const [filteredData, setFilteredData] = useState([]); // Inicializado como un array vacío
    const url = "http://localhost:8000/api/istg/";
    const mostrarNotificacion = (tipo, titulo, mensaje) => {
        notification[tipo]({
            message: titulo,
            description: mensaje,
        });
    };
    useEffect(() => {
        getJornada();
    }, [filterJornada]);

    function handleCloseModal() {
        setIsOpenNewModal(false);
        setIsOpenUpdateModal(false);
    }

    function getJornada() {
        setLoading(true);
        fetch(`${url}show_jornada`, { method: 'GET' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                console.log("API response data:", data); // Debugging line
                let jornada = data.data.map((value, index) => {
                    return {
                        numero: index + 1,
                        id: value.id_jornada,
                        descripcion: value.descripcion,
                        ip_actualizacion: value.ip_actualizacion,
                        fecha_actualizacion: new Date(value.fecha_actualizacion).toLocaleDateString(),
                        usuarios_ultima_gestion: value.usuarios_ultima_gestion,
                        estado: value.estado,
                    };
                });
                // Filtrar datos 
                if (filterJornada) {
                    jornada = jornada.filter(item =>
                        item.descripcion.toLowerCase().includes(filterJornada.toLowerCase())
                    );
                }
                setJornada(jornada);
                setFilteredData(jornada);
            })
            .catch((error) => {
                console.error("Error fetching data:", error); // Debugging line
            })
            .finally(() => {
                setLoading(false);
            });
    }


    const handleMenuClick = (action, record) => {
        console.log(`Se hizo clic en "${action}" para el usuario con cédula ${record}`);

        if (action === "editar") {
            setIsOpenUpdateModal(true);
            setFormularioEditar(record);
        }
    };


    const menu = (record) => (
        <Menu onClick={({ key }) => handleMenuClick(key, record)}>
            <Menu.Item key="editar"><EditOutlined /></Menu.Item>
            <Menu.Item key="eliminar"><DeleteOutlined /></Menu.Item>
        </Menu>
    );

    return (
        <Spin spinning={loading} tip="Cargando...">
            <>

                <Row style={{ display: "flex", justifyContent: "center" }}>
                    <Title level={3}>Mantenimiento de Jornada</Title>
                </Row>

                <Card bordered={false}>
                    <Space style={{ margin: "5px" }}>
                        <Row gutter={{ xs: 8, sm: 24, md: 150, lg: 24 }}>
                            <Col>
                                <Button icon={<UserAddOutlined />} onClick={() => setIsOpenNewModal(true)}>Crear una jornada</Button>
                            </Col>
                            <Col>
                                <Button icon={<SyncOutlined />} onClick={getJornada}>Descargar datos</Button>
                            </Col>
                            <Col>
                                <Input
                                    placeholder="Filtrar por Jornada"
                                    value={filterJornada}
                                    onChange={(e) => setFilterJornada(e.target.value)}
                                    allowClear
                                />
                            </Col>
                        </Row>
                    </Space>
                    <Row>
                        <Title level={5}>Cantidad : {jornadaData.length}</Title>
                    </Row>
                    <Table
                        size="small"
                        scroll={{ x: 100 }}
                        style={{ margin: "5px" }}
                        dataSource={jornadaData}
                        columns={[
                            {
                                dataIndex: 'numero',
                                title: 'Nª',
                                width: 20,
                                align: 'center'
                            },
                            {
                                dataIndex: 'descripcion',
                                title: 'descripcion',
                                width: 20
                            },
                            {
                                dataIndex: 'usuarios_ultima_gestion',
                                title: 'Usuario ultima gestion',
                                width: 75,
                                align: 'center'
                            },
                            {
                                dataIndex: 'fecha_actualizacion',
                                title: 'fecha ultima gestion',
                                width: 20,
                                align: 'center'
                            },
                            {
                                dataIndex: 'estado',
                                title: 'Estado',
                                width: 20,
                                align: 'center'
                            },
                            {
                                dataIndex: "accion",
                                title: "Acciones",
                                align: 'center',
                                width: 20,
                                render: (_, record) => (
                                    <Dropdown overlay={menu(record)} trigger={['click']}>
                                        <Button><MenuOutlined /></Button>
                                    </Dropdown>
                                ),
                            }
                        ]}
                    />
                </Card>
                <NewJornada open={isOpeNewJornada} handleCloseModal={handleCloseModal} getJornada={getJornada} />
            </>
        </Spin>
    );

};

export default Jornada;
