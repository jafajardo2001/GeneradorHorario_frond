import Card from "antd/es/card/Card";
import React, { useState, useEffect } from "react";
import { Button, Collapse, Input, Table, Typography, Menu, Dropdown, Spin, Modal } from "antd";
import { FilterOutlined, UserOutlined, MenuOutlined, DeleteOutlined, EditOutlined, FolderViewOutlined } from "@ant-design/icons";
import { Row, Col, Space } from "antd";
import { UserAddOutlined, ClearOutlined, SearchOutlined, SyncOutlined } from "@ant-design/icons";
import NewUsuario from "../../components/NewUsuario.js";
import UpdateUsuario from "../../components/UpdateUsuario.js";

const Usuarios = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(true);
  const [mensajeLoading, setMensajeLoading] = useState("cargando...");
  const [isOpenModal, setIsOpen] = useState(false); // Para el modal de crear 
  const [dataTabla, setDataTabla] = useState([]);
  const [cantidadRegistro, setCantidadRegistro] = useState(0);
  const [isOpenUpdateUsuario, setIsOpenUpdateModal] = useState(false); // Para el modal de editar
  const [selectedUserId, setSelectedUserId] = useState(null);  // Estado para el usuario seleccionado
  const [selectedUserData, setSelectedUserData] = useState(null); // Para almacenar los datos del usuario seleccionado
  const [filterUsuario, setFilterUsuario] = useState(""); // Nuevo estado para el filtro
  const [filteredData, setFilteredData] = useState([]); // Inicializado como un array vacío
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false); // Estado para el modal de confirmación
  const [userToDelete, setUserToDelete] = useState(null); // Almacena el ID del usuario a eliminar
  const url = "http://localhost:8000/api/istg/";

  const handleCloseModal = () => {
    setIsOpen(false);
    setIsOpenUpdateModal(false);
  };

  const handleMenuClick = (action, record) => {
    if (action === "editar") {
      setSelectedUserId(record.id); // Almacena el ID del usuario seleccionado
      setSelectedUserData(record);  // Almacena los datos del usuario seleccionado
      setIsOpenUpdateModal(true);  // Abre el modal de edición
    } else if (action === "eliminar") {
      setUserToDelete(record.id); // Guarda el ID del usuario a eliminar
      setIsConfirmDeleteVisible(true); // Abre el modal de confirmación
    }
    console.log(`Se hizo clic en "${action}" para el usuario con cédula ${record.cedula}`);
  };

  const menu = (record) => (
    <Menu onClick={({ key }) => handleMenuClick(key, record)}>
      <Menu.Item key="editar">
        <EditOutlined /> Editar
      </Menu.Item>
      <Menu.Item key="eliminar">
        <DeleteOutlined /> Eliminar
      </Menu.Item>
      <Menu.Item key="visualizar_informacion">
        <FolderViewOutlined /> Ver Información
      </Menu.Item>
    </Menu>
  );

  const handleDeleteUsuario = () => {
    setLoading(true);
    fetch(`${url}delete_usuario/${userToDelete}`, {
      method: 'PUT', // Cambia a PUT
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la eliminación');
        }
        return response.json();
      })
      .then((data) => {
        // Puedes mostrar un mensaje de éxito
        console.log(data.message);
        getUser(); // Refresca la lista de usuarios
      })
      .catch((error) => {
        console.error('Error al eliminar el usuario:', error);
      })
      .finally(() => {
        setLoading(false);
        setIsConfirmDeleteVisible(false); // Cierra el modal de confirmación
        setUserToDelete(null); // Reinicia el usuario a eliminar
      });
  };

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
          job_descripcion: value.job_descripcion,
          carreras: value.carreras.map(carrera => `${carrera.nombre} (${carrera.jornada_descripcion || 'Sin jornada'})`).join(', '),
          estado: value.estado,
        }));

        // Filtrar datos 
        if (filterUsuario) {
          informacion = informacion.filter(item =>
            `${item.cedula} ${item.nombres + item.apellidos} ${item.correo} ${item.titulo_academico} ${item.job_descripcion} ${item.carreras}`.toLowerCase().includes(filterUsuario.toLowerCase())
          );
        }

        setCantidadRegistro(informacion.length);
        setDataTabla(informacion);
        setFilteredData(informacion);  // Opcional si planeas usar este estado en el futuro
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
                title: "Cédula",
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
                title: "Teléfono",
                width: 30,
              },
              {
                dataIndex: "job_descripcion",
                title: "Tiempo Laboral",
                width: 30,
              },
              {
                dataIndex: "usuarios",
                title: "Usuario",
                width: 20,
              },
              {
                dataIndex: "titulo_academico",
                title: "Título Académico",
                width: 20,
              },
              {
                dataIndex: "carreras",  // Asegúrate que el campo coincida
                title: "Carreras",
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
            scroll={{ x: 100 }}
          />
        </Card>

        {/* Modal para crear un nuevo usuario */}
        <NewUsuario
          isOpen={isOpenModal}
          onCloseModal={handleCloseModal}
          getUser={getUser}
          loading={setLoading}
          mensaje={setMensajeLoading}
        />

        {/* Modal para actualizar un usuario */}
        <UpdateUsuario
          isOpen={isOpenUpdateUsuario}  // Abre el modal de edición
          onCloseModal={handleCloseModal}
          userId={selectedUserId}  // Pasa el ID del usuario seleccionado
          getUser={getUser}  // Refresca los datos después de editar
        />

        {/* Modal de confirmación para eliminar */}
        <Modal
          title="Confirmar eliminación"
          visible={isConfirmDeleteVisible}
          onOk={handleDeleteUsuario}
          onCancel={() => setIsConfirmDeleteVisible(false)}
        >
          <p>¿Estás seguro de que deseas eliminar este usuario?</p>
        </Modal>
      </>
    </Spin>
  );
};

export default Usuarios;
