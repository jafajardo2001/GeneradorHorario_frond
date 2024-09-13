import React, { useState, useEffect } from "react";
import { Button, Row, Col, Space, Table, Typography, Menu, Dropdown, Card, Spin, notification } from "antd";
import { SyncOutlined, UserAddOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons";
import NewJob from "../../components/NewJob.js";

const Tiempo = () => {
    const { Title } = Typography;
    const [loading,setLoading] = useState(true);
    const [mensajeLoading,setMensajeLoading] = useState("cargando...");
    const [jobsData, setJobs] = useState([]);
    const [isOpeNewJob, setIsOpenNewModal] = useState(false);
    const [formularioEditar, setFormularioEditar] = useState([]);
    const url = "http://localhost:8000/api/istg/";
    const mostrarNotificacion = (tipo,titulo,mensaje) => {
      notification[tipo]({
        message: titulo,
        description: mensaje,
      });
    };
    
    useEffect(() => {
        getJobs();
    }, []);

    function handleCloseModal() {
        setIsOpenNewModal(false);
    }
    
    function getJobs() {
        setLoading(true)
        fetch(`${url}show_jobs`, { method: 'GET' })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            console.log("API response data:", data); // Debugging line
            let jobs = data.data.map((value, index) => {
                return {
                    numero: index + 1,
                    id: value.id_job,
                    descripcion: value.descripcion,
                    ip_actualizacion: value.ip_actualizacion,
                    fecha_actualizacion: new Date(value.fecha_actualizacion).toLocaleDateString(),
                    usuarios_ultima_gestion: value.usuarios_ultima_gestion,
                    estado: value.estado,
                };
            });
            setJobs(jobs);
        })
        .catch((error) => {
         console.error("Error fetching data:", error); // Debugging line
        }).finally(()=>{
         setLoading(false)
        });
    }

    const handleMenuClick = (action, record) => {
        console.log(`Se hizo clic en "${action}" para el usuario con cédula ${record}`);
        
        if (action === "editar") {
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
            <Title level={3}>Mantenimiento de Trabajo</Title>
          </Row>
    
          <Card bordered={false}>
            <Space style={{ margin: "5px" }}>
              <Row gutter={{ xs: 8, sm: 24, md: 150, lg: 24 }}>
                <Col>
                  <Button icon={<UserAddOutlined />} onClick={() => setIsOpenNewModal(true)}>Crear un perfil</Button>
                </Col>
                <Col>
                  <Button icon={<SyncOutlined />} onClick={getJobs}>Descargar datos</Button>
                </Col>
              </Row>
            </Space>
            <Row>
              <Title level={5}>Cantidad : {jobsData.length}</Title>
            </Row>
            <Table
              size="small"
              scroll={{ x: 100 }}
              style={{ margin: "5px" }}
              dataSource={jobsData}
              columns={[
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
          <NewJob open={isOpeNewJob} handleCloseModal={handleCloseModal} getJobs={getJobs} />
        </>
      </Spin> 
    );
};

export default Tiempo;