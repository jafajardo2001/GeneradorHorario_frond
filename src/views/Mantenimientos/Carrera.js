import React, { useState, useEffect } from "react";
import { Button, Row, Col, Space, Table, Typography, Menu, Dropdown, Card, Spin, notification, Input, Modal } from "antd";
import { SyncOutlined, UserAddOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons";
import NewCarrera from "../../components/NewCarrera.js";
import UpdateCarrera from "../../components/UpdateCarrera.js";

const Carreras = () => {
    const { Title } = Typography;
    const [loading, setLoading] = useState(true);
    const [mensajeLoading, setMensajeLoading] = useState("cargando...");
    const [carrerasData, setCarreras] = useState([]);
    const [isOpeNewCarrera, setIsOpenNewModal] = useState(false);
    const [isOpenUpdateCarrera, setIsOpenUpdateModal] = useState(false);
    const [formularioEditar, setFormularioEditar] = useState([]);
    const [filterCarrera, setFilterCarrera] = useState(""); // Nuevo estado para el filtro
    const [filteredData, setFilteredData] = useState([]); // Inicializado como un array vacío
    const url = "http://localhost:8000/api/istg/";
    
    const mostrarNotificacion = (tipo, titulo, mensaje) => {
        notification[tipo]({
            message: titulo,
            description: mensaje,
        });
    };

    useEffect(() => {
        getCarreras();
    }, [filterCarrera]);

    function handleCloseModal() {
        setIsOpenNewModal(false);
        setIsOpenUpdateModal(false);
    }

    function getCarreras() {
        setLoading(true);
        fetch(`${url}show_carrera`, { method: 'GET' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                let carrera = data.data.map((value, index) => {
                    return {
                        numero: index + 1,
                        id: value.id_carrera,
                        nombre: value.nombre,
                        estado: value.estado === "A" ? "Activo" : "Inactivo",
                        jornada: value.descripcion_jornada,
                        id_jornada: value.id_jornada,
                    };
                });

                // Filtrar datos
                if (filterCarrera) {
                    carrera = carrera.filter(item =>
                        item.nombre.toLowerCase().includes(filterCarrera.toLowerCase())
                    );
                }
                setCarreras(carrera);
                setFilteredData(carrera);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            }).finally(() => {
                setLoading(false);
            });
    }

    const handleMenuClick = (action, record) => {
        console.log(`Se hizo clic en "${action}" para la carrera con ID ${record.id}`);
    
        if (action === "editar") {
            setIsOpenUpdateModal(true);
            setFormularioEditar(record);
        }
    
        if (action === "eliminar") {
            // Verificar si hay distribuciones asociadas
            fetch(`${url}distribuciones_por_carrera/${record.id}`) // Asegúrate de tener esta ruta que verifica si hay distribuciones
                .then((response) => response.json())
                .then((data) => {
                    if (data.ok && data.count > 0) {
                        // Si hay distribuciones asociadas
                        Modal.confirm({
                            title: 'Eliminar Carrera',
                            content: `¿Está seguro de que desea eliminar la carrera "${record.nombre}"? Esto también inhabilitará las distribuciones asociadas.`,
                            okText: 'Eliminar',
                            cancelText: 'Cancelar',
                            onOk: () => deleteCarrera(record.id),
                        });
                    } else {
                        // Si no hay distribuciones
                        Modal.confirm({
                            title: 'Eliminar Carrera',
                            content: `¿Está seguro de que desea eliminar la carrera "${record.nombre}"? Esta acción no afectará al sistema.`,
                            okText: 'Eliminar',
                            cancelText: 'Cancelar',
                            onOk: () => deleteCarrera(record.id),
                        });
                    }
                })
                .catch(error => {
                    console.error("Error al verificar distribuciones:", error);
                });
        }
    };

    const deleteCarrera = async (id) => {
        try {
            const response = await fetch(`${url}delete_carrera/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                mostrarNotificacion('success', 'Eliminación exitosa', data.message);
                getCarreras(); // Volver a cargar la lista de carreras
            } else {
                mostrarNotificacion('error', 'Error', data.message || 'No se pudo eliminar la carrera');
            }
        } catch (error) {
            console.error("Error al eliminar la carrera:", error);
            mostrarNotificacion('error', 'Error', 'Error interno en el servidor');
        }
    };

    const menu = (record) => (
        <Menu onClick={({ key }) => handleMenuClick(key, record)}>
            <Menu.Item key="editar"><EditOutlined /> Editar</Menu.Item>
            <Menu.Item key="eliminar"><DeleteOutlined /> Eliminar</Menu.Item>
        </Menu>
    );

    return (
        <Spin spinning={loading} tip="Cargando...">
            <>
                <Row style={{ display: "flex", justifyContent: "center" }}>
                    <Title level={3}>Mantenimiento de Carreras</Title>
                </Row>

                <Card bordered={false}>
                    <Space style={{ margin: "5px" }}>
                        <Row gutter={{ xs: 8, sm: 24, md: 150, lg: 24 }}>
                            <Col>
                                <Button icon={<UserAddOutlined />} onClick={() => setIsOpenNewModal(true)}>Crear un perfil</Button>
                            </Col>
                            <Col>
                                <Button icon={<SyncOutlined />} onClick={getCarreras}>Descargar datos</Button>
                            </Col>
                            <Col>
                                <Input
                                    placeholder="Filtrar por Carrera"
                                    value={filterCarrera}
                                    onChange={(e) => setFilterCarrera(e.target.value)}
                                    allowClear
                                />
                            </Col>
                        </Row>
                    </Space>
                    <Row>
                        <Title level={5}>Cantidad : {carrerasData.length}</Title>
                    </Row>
                    <Table
                        size="small"
                        scroll={{ x: 100 }}
                        style={{ margin: "5px" }}
                        dataSource={carrerasData}
                        columns={[
                            {
                                dataIndex: 'numero',
                                title: 'Nª',
                                width: 20,
                                align: 'center'
                            },
                            {
                                dataIndex: 'nombre',
                                title: 'Descripción',
                                width: 20
                            },
                            {
                                dataIndex: 'jornada',
                                title: 'Jornada',  // Nueva columna para mostrar la jornada
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
                <NewCarrera open={isOpeNewCarrera} handleCloseModal={handleCloseModal} getCarreras={getCarreras} />
                <UpdateCarrera open={isOpenUpdateCarrera} handleCloseModal={handleCloseModal} getCarreras={getCarreras} formulario={formularioEditar} loading={setLoading} mensaje={setMensajeLoading} />
            </>
        </Spin>
    );
};

export default Carreras;
