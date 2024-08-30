import React, { useEffect, useState } from "react";
import { Typography, Row, Card, Space, Col, Button, Table, Dropdown, Menu, Spin, notification, Modal, Input } from "antd";
import NewPlanificacionAcademica from "../../components/NewPlanificacionAcademica";
import { DeleteOutlined, EditOutlined, MenuOutlined, PlusCircleOutlined, SyncOutlined } from "@ant-design/icons";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PlanificacionAcademica = () => {
    const url = "http://localhost:8000/api/istg/";
    const { Title } = Typography;
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [dataTable, setDataTable] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDocente, setFilterDocente] = useState(""); // Nuevo estado para el filtro
    const [filteredData, setFilteredData] = useState([]); // Inicializado como un array vacío

    const handleMenuClick = async (action, record) => {
        console.log(`Acción: ${action}, Registro:`, record);
        if (action === "eliminar") {
            try {
                if (!record.id_distribucion) {
                    console.error('ID de distribución no encontrado en el registro');
                    return;
                }

                const response = await fetch(`${url}horario/delete_distribucion/${record.id_distribucion}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                if (data.ok) {
                    notification.success({
                        message: 'Operacion Éxito',
                        description: 'Distribución eliminada correctamente.',
                        placement: 'topRight',
                    });
                    getDistribucion();
                } else {
                    notification.error({
                        message: 'Error',
                        description: data.mensaje || 'No se pudo eliminar la distribución.',
                        placement: 'topRight',
                    });
                }
            } catch (error) {
                notification.error({
                    message: 'Error',
                    description: 'Error en la eliminación: ' + error.message,
                    placement: 'topRight',
                });
            }
        }
    };

    const menu = (record) => (
        <Menu onClick={({ key }) => handleMenuClick(key, record)}>
            <Menu.Item key="editar"><EditOutlined /> Editar</Menu.Item>
            <Menu.Item key="eliminar"><DeleteOutlined /> Eliminar</Menu.Item>
        </Menu>
    );

    const handleGenerateReport = () => {
        if (!filteredData || filteredData.length === 0) {
            notification.error({
                message: 'Error',
                description: 'No hay datos para generar el reporte.',
                placement: 'topRight',
            });
            return;
        }

        const doc = new jsPDF();
        doc.text("INSTITUTO SUPERIOR TECNOLÓGICO", 10, 10);
        doc.text("GUAYAQUIL", 10, 20);

        doc.autoTable({
            startY: 50,
            head: [['Asignatura', 'Carrera', 'Nivel', 'Paralelo', 'Día', 'Horario']],
            body: filteredData.map(row => [
                row.materia,
                row.carrera,
                row.nivel,
                row.paralelo,
                row.dia,
                row.hora_inicio + "" + row.hora_termina
            ])
        });

        doc.save('reporte-distributivo.pdf');
    };

    useEffect(() => {
        getDistribucion();
    }, []);

    function getDistribucion() {
        setLoading(true);
        fetch(`${url}horario/show_dist_horarios`, { method: 'GET' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                let Distribucion = data.data.map((value, index) => {
                    return {
                        index: index + 1,
                        id_distribucion: value?.id_distribucion,
                        educacion_global: value?.educacion_global_nombre,
                        carrera: value?.nombre_carrera,
                        id_usuario: value?.id_usuario,
                        materia: value?.materia,
                        nivel: value?.nivel,
                        paralelo: value?.paralelo,
                        dia: value?.dia,
                        hora_inicio: value?.hora_inicio,
                        hora_termina: value?.hora_termina,
                        fecha_actualizacion: new Date(value?.fecha_actualizacion).toLocaleDateString(),
                        usuarios_ultima_gestion: value?.usuarios_ultima_gestion,
                        estado: value?.estado,
                        docente: value?.nombre_docente
                    };
                });

                // Filtrar datos según el filtro de docente
                if (filterDocente) {
                    Distribucion = Distribucion.filter(item => 
                        item.docente.toLowerCase().includes(filterDocente.toLowerCase())
                    );
                }

                setDataTable(Distribucion);
                setFilteredData(Distribucion); // Actualizar también el estado filteredData
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function handleCloseModal(){
        setModalIsOpen(false);
    }

    useEffect(() => {
        getDistribucion();
    }, [filterDocente]); // Agregar filterDocente como dependencia para actualizar la tabla al cambiar el filtro

    return (
        <Spin spinning={loading} tip="Cargando...">
        <>
        <Row style={{
            display:"flex",
            justifyContent:"center"
        }}>
            <Title level={3}>Distribucion Horario</Title>
        </Row>
        <Card bordered={false}>
        
            <Space style={{margin:"5px"}}>
                <Row gutter={{ xs: 8, sm: 24, md: 150, lg: 24 }}>
                    <Col>
                        <Button icon={<PlusCircleOutlined />} onClick={() => setModalIsOpen(true)} type="primary">
                            Crear una Distribucion de horarios
                        </Button>
                    </Col>
                    <Col>
                        <Button icon={<SyncOutlined />} onClick={getDistribucion}>
                            Descargar datos
                        </Button>
                    </Col>
                    <Col>
                        <Input 
                            placeholder="Filtrar por docente" 
                            value={filterDocente} 
                            onChange={(e) => setFilterDocente(e.target.value)} 
                            allowClear 
                        />
                    </Col>
                    <Col>
                        <button onClick={handleGenerateReport}>Generar Reporte</button>
                        <table>
                            {/* Tu tabla de planificación académica */}
                        </table>
                    </Col>
                </Row>
            </Space>
            <Table
                columns={[
                    {
                        dataIndex:"index",
                        title:"Nº",
                        width:10,
                        align:"center"
                    },
                    {
                        dataIndex:"educacion_global",
                        title:"Instituto",
                        width:50,
                        align:"center"
                    },
                    {
                        dataIndex:"carrera",
                        title:"Carrera",
                        width:50,
                        align:"center"
                    },
                    {
                        dataIndex:"materia",
                        title:"Materias",
                        width:50,
                        align:"center"
                    },
                    {
                        dataIndex:"docente",
                        title:"Docente",
                        width:50,
                        align:"center"
                    },
                    {
                        dataIndex:"nivel",
                        title:"Nivel",
                        width:50,
                        align:"center"
                    },
                    {
                        dataIndex:"paralelo",
                        title:"Paralelos",
                        width:50,
                        align:"center"
                    },
                    {
                        dataIndex:"dia",
                        title:"Dias",
                        width:50,
                        align:"center"
                    },
                    {
                        dataIndex:"hora_inicio",
                        title:"Hora de Inicio",
                        width:50,
                        align:"center"
                    },
                    {
                        dataIndex:"hora_termina",
                        title:"Hora de Fin",
                        width:50,
                        align:"center"
                    },
                    {
                        dataIndex:'fecha_actualizacion',
                        title:'fecha ultima gestion',
                        width:25,
                        align:'center'
        
                      },
                      {
                        dataIndex: "accion",
                        title: "Acciones",
                        align:'center',
                        width: 25,
                        render: (_, record) => (
                          <Dropdown overlay={menu(record)} trigger={['click']}>
                            <Button><MenuOutlined/></Button>
                          </Dropdown>
                        ),
                      },
                ]}
                dataSource={dataTable}
                size="middle"
                pagination={{
                    pageSize:10,
                    showTotal: total => `Total ${total} items`
                }}
            />
        </Card>
        <Modal
            title="Registro de Planificacion"
            open={modalIsOpen}
            onCancel={handleCloseModal}
            footer={null}
        >
            <NewPlanificacionAcademica/>
        </Modal>
        </>
        </Spin>
    );
};

export default PlanificacionAcademica;
