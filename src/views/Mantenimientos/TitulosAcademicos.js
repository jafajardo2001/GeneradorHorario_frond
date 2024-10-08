import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Space, Table, Typography, Menu, Dropdown, Spin, Input, notification } from "antd";
import { SyncOutlined, FileAddOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons";
import NewTitulo from "../../components/NewTitulo.js";
import UpdateTitulo from "../../components/UpdateTitulo.js";

const TitulosAcademicos = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(true);
  const [mensajeLoading, setMensajeLoading] = useState("cargando...");
  const [titulosData, setTitulos] = useState([]);
  const [isOpenNewTitulo, setIsOpenNewModal] = useState(false);
  const [isOpenUpdateTitulo, setIsOpenUpdateModal] = useState(false);
  const [formularioEditar, setFormularioEditar] = useState([]);
  const [filterTitulo, setFilterTitulo] = useState(""); // Nuevo estado para el filtro
  const [filteredData, setFilteredData] = useState([]); // Inicializado como un array vacío
  const [api, contextHolder] = notification.useNotification();
  const url = "http://localhost:8000/api/istg/";

  useEffect(() => {
    getTitulos();
  }, [filterTitulo]);

  const handleCloseModal = () => {
    setIsOpenNewModal(false);
    setIsOpenUpdateModal(false);
  };

  const mostrarNotificacion = (tipo, titulo, mensaje) => {
    api[tipo]({
      message: titulo,
      description: mensaje,
    });
  };

  const getTitulos = () => {
    setLoading(true);
    fetch(`${url}show_data_titulo_academico`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        if (data.data) {
          let titulos = data.data.map((value, index) => {
            return {
              numero: index + 1,
              id: value?.id_titulo_academico,
              descripcion: value?.descripcion,
              fecha_creacion: new Date(value.fecha_creacion).toLocaleDateString(),
              fecha_actualizacion: value?.fecha_actualizacion
                ? new Date(value?.fecha_actualizacion).toLocaleDateString()
                : 'N/A',
              estado: value?.estado === 'A' ? 'Activo' : 'Inactivo'
            };
          });

          // Filtrar datos, excluyendo los que están en estado 'E' (Eliminado)
          titulos = titulos.filter(item => item.estado !== 'Inactivo');

          // Filtrar adicionalmente por el término de búsqueda (filterTitulo)
          if (filterTitulo) {
            titulos = titulos.filter(item =>
              item.descripcion.toLowerCase().includes(filterTitulo.toLowerCase())
            );
          }

          setTitulos(titulos);
          setFilteredData(titulos);
        }
      })
      .catch(() => {
        setTitulos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteTituloAcademico = (values) => {
    console.log("Estoy entrando en la funcion de value");
    console.log(values);
    let request_backend = {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        id_titulo_academico: values.id  // Asegúrate de que el backend espere este campo
      })
    };
    fetch(`${url}delete_titulo_academico/${values.id}`, request_backend)  // ID incluido en la URL
      .then((data_request) => data_request.json())
      .then((data) => {
        if (data.ok) {
          mostrarNotificacion("success", "Operación realizada con éxito", "El curso " + values.descripcion + " se eliminó con éxito");
        } else if (data.ok === false) {
          mostrarNotificacion("error", "Ha ocurrido un error interno", data.msg);
        }
      })
      .finally(() => {
        getTitulos();
      });
  };


  const handleMenuClick = (action, record) => {
    console.log(`Se hizo clic en "${action}" para el usuario con cédula ${record}`);
    if (action === "editar") {
      setIsOpenUpdateModal(true);
      setFormularioEditar(record);
    } else if (action === "eliminar") {
      deleteTituloAcademico(record);
    }
    // Agregar lógica de eliminación si es necesario
  };

  const menu = (record) => (
    <Menu onClick={({ key }) => handleMenuClick(key, record)}>
      <Menu.Item key="editar"><EditOutlined /></Menu.Item>
      <Menu.Item key="eliminar"><DeleteOutlined /></Menu.Item>
    </Menu>
  );

  return (
    <>
      {contextHolder}
      <Spin spinning={loading} tip={mensajeLoading}>
        <Row style={{ display: "flex", justifyContent: "center" }}>
          <Title level={3}>Mantenimiento de Títulos Académicos</Title>
        </Row>

        <Card bordered={false}>
          <Space style={{ margin: "5px" }}>
            <Row gutter={{ xs: 8, sm: 24, md: 150, lg: 24 }}>
              <Col>
                <Button icon={<FileAddOutlined />} onClick={() => { setIsOpenNewModal(true) }} type="primary">
                  Crear Título Académico
                </Button>
              </Col>

              <Col>
                <Button icon={<SyncOutlined />} onClick={getTitulos}>
                  Descargar datos
                </Button>
              </Col>
              <Col>
                <Input
                  placeholder="Filtrar por Titulo"
                  value={filterTitulo}
                  onChange={(e) => setFilterTitulo(e.target.value)}
                  allowClear
                />
              </Col>
            </Row>
          </Space>
          <Row>
            <Title level={5}>Cantidad : {titulosData.length}</Title>
          </Row>
          <Table
            size="small"
            scroll={{ x: 100 }}
            style={{ margin: "5px" }}
            dataSource={titulosData}
            columns={[
              {
                dataIndex: 'numero',
                title: 'Nº',
                width: 20,
                align: 'center'
              },
              {
                dataIndex: 'descripcion',
                title: 'Descripción',
                width: 100
              },
              {
                dataIndex: 'fecha_creacion',
                title: 'Fecha de Creación',
                width: 50,
                align: 'center'
              },
              {
                dataIndex: 'fecha_actualizacion',
                title: 'Fecha de Actualización',
                width: 50,
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
      </Spin>
      <NewTitulo open={isOpenNewTitulo} handleCloseModal={handleCloseModal} getTitulos={getTitulos} />
      <UpdateTitulo open={isOpenUpdateTitulo} handleCloseModal={handleCloseModal} getTitulos={getTitulos} formulario={formularioEditar} loading={setLoading} mensaje={setMensajeLoading} />
    </>
  );
}

export default TitulosAcademicos;
