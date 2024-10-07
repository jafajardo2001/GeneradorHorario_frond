import React, { useState, useEffect } from "react";
import { Button, Row, Col, Space, Table, Typography, Menu, Dropdown, Card, Spin, notification, Input } from "antd";
import { SyncOutlined, UserAddOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons";
import NewJob from "../../components/NewJob.js";
import UpdateJob from "../../components/UpdateJob.js";

const Tiempo = () => {
    const { Title } = Typography;
    const [loading,setLoading] = useState(true);
    const [mensajeLoading,setMensajeLoading] = useState("cargando...");
    const [jobsData, setJobsData] = useState([]);
    const [isOpeNewJob, setIsOpenNewModal] = useState(false);
    const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
    const [formularioEditar, setFormularioEditar] = useState([]);
    const [filterDedicacion, setFilterDedicacion] = useState(""); // Nuevo estado para el filtro
    const [filteredData, setFilteredData] = useState([]); // Inicializado como un array vacío
    const url = "http://localhost:8000/api/istg/";
    const mostrarNotificacion = (tipo,titulo,mensaje) => {
      notification[tipo]({
        message: titulo,
        description: mensaje,
      });
    };
    
    useEffect(() => {
        getJobs();
    }, [filterDedicacion]);
    
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
             // Filtrar datos 
        if (filterDedicacion) {
          jobs = jobs.filter(item => 
              item.descripcion.toLowerCase().includes(filterDedicacion.toLowerCase())
          );
        }
        setJobsData(jobs);
        setFilteredData(jobs);
        })
        .catch((error) => {
         console.error("Error fetching data:", error); // Debugging line
        }).finally(()=>{
         setLoading(false)
        });
    }
    
    const deleteJob = (values) => {
      console.log("Estoy entrando en la función de deleteJob");
      console.log(values);
    
      let request_backend = {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          id_job: values.id
        })
      };
    
      fetch(`${url}delete_job/${values.id}`, request_backend)
        .then((data_request) => data_request.json())
        .then((data) => {
          if (data.ok) {
            mostrarNotificacion("success", "Operación realizada con éxito", "El trabajo se eliminó con éxito");
          } else {
            mostrarNotificacion("error", "Ha ocurrido un error", data.message || "No se pudo eliminar el trabajo.");
          }
        })
        .finally(() => {
          getJobs();
        });
    };
    
    
    const menu = (record) => (
      <Menu onClick={({ key }) => handleMenuClick(key, record)}>
        <Menu.Item key="editar"><EditOutlined /></Menu.Item>
        <Menu.Item key="eliminar"><DeleteOutlined /></Menu.Item>
      </Menu>
    );

    const handleMenuClick = (action, record) => {
        console.log(`Se hizo clic en "${action}" para el usuario con cédula ${record}`);
        if (action == "editar") {
          setIsOpenUpdateModal(true);
          setFormularioEditar(record);
        }
        else if (action === "eliminar") {
          deleteJob(record);
        }
    };

    function handleCloseModal() {
      setIsOpenNewModal(false);
      setIsOpenUpdateModal(false);
    }

    return (
        <Spin spinning={loading} tip={mensajeLoading}><>
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
                <Col>
              <Input
                placeholder="Filtrar por Tiempo"
                value={filterDedicacion}
                onChange={(e) => setFilterDedicacion(e.target.value)}
                allowClear
              />
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
          <UpdateJob open={isOpenUpdateModal} handleCloseModal={handleCloseModal} formulario={formularioEditar} getJobs={getJobs} loading={setLoading} mensaje={setMensajeLoading}/>
        </>
      </Spin> 
    );
};

export default Tiempo;