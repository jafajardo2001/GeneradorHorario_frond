import React, { useState, useEffect } from "react";
import { Button, Card, Col, Row, Space, Table, Typography, Dropdown, Menu, notification, Spin } from "antd";
import { FilterOutlined, UserOutlined, MenuOutlined, DeleteOutlined, EditOutlined, FolderViewOutlined } from "@ant-design/icons";
import NewUsuario from "../../components/NewUsuario";
import EditUsuario from "../../components/EditUsuario";

const Usuarios = () => {
    const { Title } = Typography;
    const [loading, setLoading] = useState(true);
    const [mensajeLoading, setMensajeLoading] = useState("Cargando...");
    const [isOpenModal, setIsOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [dataTabla, setDataTabla] = useState([]);
    const [cantidadRegistro, setCantidadRegistro] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const url = "http://localhost:8000/api/istg/";

    const handleCloseModal = () => {
        setIsOpen(false);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
    };

    const handleMenuClick = (action, record) => {
        if (action === "editar") {
            setSelectedUser(record);
            setIsEditModalOpen(true);
        } else if (action === "eliminar") {
            handleDelete(record.id);
        }
    };

    const menu = (record) => (
        <Menu onClick={({ key }) => handleMenuClick(key, record)}>
            <Menu.Item key="editar"><EditOutlined /></Menu.Item>
            <Menu.Item key="eliminar"><DeleteOutlined /></Menu.Item>
            <Menu.Item key="visualizar_informacion"><FolderViewOutlined /></Menu.Item>
        </Menu>
    );

    const handleDelete = async (id) => {
        setLoading(true);
        setMensajeLoading("Eliminando usuario...");
        try {
            const response = await fetch(`${url}delete_usuario/${id}`, {
                method: 'PUT',
            });
            const result = await response.json();
            if (result.ok) {
                notification.success({
                    message: 'Éxito',
                    description: 'Usuario eliminado con éxito',
                });
                getUser();
            } else {
                notification.error({
                    message: 'Error',
                    description: result.message || 'Error al eliminar usuario',
                });
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.message || 'Error al eliminar usuario',
            });
        } finally {
            setLoading(false);
        }
    };

    const getUser = () => {
        setLoading(true);
        fetch(`${url}show_usuario`, { method: 'GET' })
            .then((response) => response.json())
            .then((data) => {
                const informacion = data.data.map((value) => ({
                    id: value.id_usuario,
                    cedula: value.cedula,
                    nombres: value.nombres,
                    apellidos: value.apellidos,
                    perfil: value.descripcion,
                    estado: value.estado,
                    maquina_creacion: value.ip_creacion,
                    maquina_actualiso: value.ip_actualizacion,
                    creador_nombre_completo: value.creador_nombre_completo,
                }));
                setCantidadRegistro(informacion.length);
                setDataTabla(informacion);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        getUser();
    }, []);

    return (
        <>
            <Spin spinning={loading} tip={mensajeLoading}></Spin>
            <Row style={{ display: "flex", justifyContent: "center" }}>
                <Title level={3}>Mantenimiento de usuarios</Title>
            </Row>
            <Card bordered={false}>
                <Space style={{ margin: "5px" }}>
                    <Row gutter={{ xs: 8, sm: 24, md: 150, lg: 24 }}>
                        <Col>
                            <Button icon={<UserOutlined />} onClick={() => setIsOpen(true)}>Crear un usuario</Button>
                        </Col>
                        <Col>
                            <Button icon={<FilterOutlined />} onClick={() => getUser()}>Descargar datos</Button>
                        </Col>
                    </Row>
                </Space>
                <Row>
                    <Title level={5}>Cantidad : {cantidadRegistro}</Title>
                </Row>
                <Table
                    style={{ margin: "5px" }}
                    bordered={false}
                    columns={[
                        { dataIndex: "cedula", title: "Cédula", width: 20 },
                        { dataIndex: "nombres", title: "Nombres", width: 20 },
                        { dataIndex: "apellidos", title: "Apellidos", width: 30 },
                        { dataIndex: "perfil", title: "Perfil", width: 20 },
                        { dataIndex: "creador_nombre_completo", title: "Creador", width: 20, align: "center" },
                        { dataIndex: "estado", title: "Estado", width: 20, align: "center" },
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
                    dataSource={dataTabla}
                    size="small"
                    scroll={{ x: 75 }}
                />
            </Card>
            <NewUsuario isOpen={isOpenModal} onCloseModal={handleCloseModal} getUser={getUser} loading={setLoading} mensaje={setMensajeLoading} />
            <EditUsuario open={isEditModalOpen} handleCloseModal={handleEditModalClose} formulario={selectedUser} getUser={getUser} />
        </>
    );
};

export default Usuarios;
