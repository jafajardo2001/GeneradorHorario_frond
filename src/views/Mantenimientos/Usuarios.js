import Card from "antd/es/card/Card";
import React, { useState, useEffect } from "react";
import { Button, Collapse, Input, Table, Typography, Menu, Dropdown, Select, Spin } from "antd";
import { FilterOutlined, UserOutlined, MenuOutlined, DeleteOutlined, EditOutlined, FolderViewOutlined } from "@ant-design/icons";
import FormItem from "antd/es/form/FormItem";
import { Row, Col, Space } from "antd";
import { UserAddOutlined, ClearOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import NewUsuario from "../../components/NewUsuario.js";

const Usuarios = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(true);
  const [mensajeLoading, setMensajeLoading] = useState("cargando...");
  const [isOpenModal, setIsOpen] = useState(false);
  const [dataTabla, setDataTabla] = useState([]);
  const [cantidadRegistro, setCantidadRegistro] = useState(0);
  const [filterUsuario, setFilterUsuario] = useState(""); // Nuevo estado para el filtro
  const [filteredData, setFilteredData] = useState([]); // Inicializado como un array vacío
  const url = "http://localhost:8000/api/istg/";

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleMenuClick = (action, record) => {
    console.log(record);
    console.log(`Se hizo clic en "${action}" para el usuario con cédula ${record}`);
  };

  const menu = (record) => (
    <Menu onClick={({ key }) => handleMenuClick(key, record)}>
      <Menu.Item key="editar"><EditOutlined /></Menu.Item>
      <Menu.Item key="eliminar"><DeleteOutlined /></Menu.Item>
      <Menu.Item key="visualizar_informacion"><FolderViewOutlined /></Menu.Item>
    </Menu>
  );

  function getUser() {
    setLoading(true);
    fetch(`${url}show_usuario`, { method: 'GET' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        let informacion = data.data.map((value) => ({
          id: value.id_usuario,
          cedula: value.cedula,
          usuarios: value.usuario,
          nombres: value.nombres,
          apellidos: value.apellidos,
          correo: value.correo,
          telefono: value.telefono,
          perfil: value.rol_descripcion,
          titulo_academico: value.titulo_academico_descripcion,
          estado: value.estado,
          job_descripcion: value.job_descripcion,
          carreras: value.carrera_nombre,  // Asegúrate de que esto esté correcto
          maquina_creacion: value.ip_creacion,
          maquina_actualiso: value.ip_actualizacion,
        }));
        // Filtrar datos 
        if (filterUsuario) {
          informacion = informacion.filter(item => 
            `${item.nombres} ${item.apellidos} ${item.perfil} ${item.cedula} ${item.correo}`.toLowerCase().includes(filterUsuario.toLowerCase())
          );
        }
        console.log("Data recibida:", informacion);  // Revisa en la consola si tienes la información correcta
        setCantidadRegistro(informacion.length);
        setDataTabla(informacion);
        setFilteredData(informacion); // Opcional si planeas usar este estado en el futuro
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    getUser();
  }, [filterUsuario]);

  return (
    <Spin spinning={loading} tip="Cargando...">
    <>
      
      <Row style={{ display: "flex", justifyContent: "center" }}>
        <Title level={3}>Mantenimiento de usuarios</Title>
      </Row>
      <Card bordered={false}>
        <Space style={{ margin: "5px" }}>
          <Row gutter={{ xs: 8, sm: 24, md: 150, lg: 24 }}>
            <Col>
              <Button icon={<UserAddOutlined />} onClick={() => { setIsOpen(true); }}>
                Crear un usuario
              </Button>
            </Col>
            <Col>
              <Button icon={<SyncOutlined />} onClick={() => { getUser(); }}>
                Descargar datos
              </Button>
            </Col>
            <Col>
              <Input
                placeholder="Filtrar por usuario"
                value={filterUsuario}
                onChange={(e) => setFilterUsuario(e.target.value)}
                allowClear
              />
            </Col>
            <Col>
              <Button icon={<ClearOutlined />}>Limpiar</Button>
            </Col>
            <Col>
              <Button icon={<SearchOutlined />}>Buscar</Button>
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
            {
              dataIndex: "cedula",
              title: "Cedula",
              width: 20,
            },
            {
              dataIndex: "nombres",
              title: "Nombres",
              width: 20,
            },
            {
              dataIndex: "apellidos",
              title: "Apellidos",
              width: 30,
            },
            {
              dataIndex: "correo",
              title: "Correo",
              width: 30,
            },
            {
              dataIndex: "telefono",
              title: "Telefono",
              width: 30,
            },
            {
              dataIndex: "job_descripcion",
              title: "tiempo laboral",
              width: 30,
            },
            {
              dataIndex: "usuarios",
              title: "Usuario",
              width: 20,
            },
            {
              dataIndex: "titulo_academico",
              title: "Titulo Academico",
              width: 20,
            },
            {
              dataIndex: "carreras",  // Debe coincidir con el campo mapeado en `getUser`
              title: "Carrera",
              width: 20,
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
            },
          ]}
          dataSource={dataTabla}
          size="small"
          scroll={{ x: 100 }}  // Asegúrate de ajustar el scroll si es necesario
        />
      </Card>
      <NewUsuario 
      isOpen={isOpenModal} 
      onCloseModal={handleCloseModal} 
      getUser={getUser}  // Aquí estás pasando la función getUser
      loading={setLoading} 
      mensaje={setMensajeLoading} 
    />
    </>
  </Spin>
  );
};

export default Usuarios;