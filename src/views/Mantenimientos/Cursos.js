import React, { useState, useEffect } from "react";
import { Button, Row, Col, Space, Table, Typography, Menu, Dropdown, Card, Spin, notification, Input, Modal } from "antd";
import { SyncOutlined, PlusCircleOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons";
import NewCurso from "../../components/NewCurso.js";
import UpdateCurso from "../../components/UpdateCurso.js";

const Cursos = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(true);
  const [isOpenModal, setIsOpen] = useState(false);
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [cursoData, setCursoData] = useState([]);
  const [formularioEditar, setFormularioEditar] = useState([]);
  const [filterCurso, setFilterCurso] = useState(""); 
  const url = "http://localhost:8000/api/istg/";

  useEffect(() => {
    getCurso();
  }, [filterCurso]);

  const mostrarNotificacion = (tipo, titulo, mensaje) => {
    notification[tipo]({
      message: titulo,
      description: mensaje,
    });
  };

  const getCurso = () => {
    setLoading(true);
    fetch(`${url}show_nivel`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        let curso = data.data.map((value, index) => {
          return {
            id: value.id_nivel,
            numero: value.numero,
            nemonico: value.nemonico,
            termino: value.termino,
            estado: value.estado,
            fecha_actualizacion: new Date(value.fecha_actualizacion).toLocaleDateString(),
            usuarios_ultima_gestion: value.usuarios_ultima_gestion,
          };
        });

        if (filterCurso) {
          curso = curso.filter(item =>
            `${item.numero} ${item.nemonico} ${item.termino}`.toLowerCase().includes(filterCurso.toLowerCase())
          );
        }

        setCursoData(curso);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const checkDistribuciones = async (id) => {
    try {
      const response = await fetch(`${url}distribuciones_por_curso/${id}`);
      const data = await response.json();

      if (data.ok) {
        return data.count > 0; // Retorna true si hay distribuciones
      } else {
        throw new Error(data.message || "Error desconocido");
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error', error.message);
      return false; // Por defecto, si hay error, consideramos que no hay distribuciones
    }
  };

  const handleMenuClick = async (action, record) => {
    if (action === "eliminar") {
      const hasDistribuciones = await checkDistribuciones(record.id); // Verificamos si hay distribuciones

      const content = hasDistribuciones
        ? `¿Está seguro de que desea eliminar el curso "${record.termino}"? Esta acción eliminará también las distribuciones asociadas.`
        : `¿Está seguro de que desea eliminar el curso "${record.termino}"? Esta acción no afectará al sistema.`;

      Modal.confirm({
        title: 'Eliminar Curso',
        content,
        okText: 'Eliminar',
        cancelText: 'Cancelar',
        onOk: () => deleteCurso(record.id), // Eliminar curso si se confirma
      });
    } else if (action === "editar") {
      setIsOpenUpdateModal(true);
      setFormularioEditar(record);
    }
  };

  const deleteCurso = (id) => {
    fetch(`${url}delete_nivel/${id}`, { method: 'PUT' })
      .then(response => response.json())
      .then(data => {
        if (data.ok) {
          mostrarNotificacion('success', 'Operación realizada con éxito', `El curso se eliminó con éxito.`);
          getCurso(); // Recargar cursos después de eliminar
        } else {
          mostrarNotificacion('error', 'Error', data.message || 'No se pudo eliminar el curso.');
        }
      })
      .catch((error) => {
        mostrarNotificacion('error', 'Error', error.message);
      });
  };

  const menu = (record) => (
    <Menu onClick={({ key }) => handleMenuClick(key, record)}>
      <Menu.Item key="editar"><EditOutlined /> Editar</Menu.Item>
      <Menu.Item key="eliminar"><DeleteOutlined /> Eliminar</Menu.Item>
    </Menu>
  );

  return (
    <Spin spinning={loading} tip="Cargando...">
      <Row style={{ display: "flex", justifyContent: "center" }}>
        <Title level={3}>Mantenimiento de Cursos</Title>
      </Row>
      <Card bordered={false}>
        <Space style={{ margin: "5px" }}>
          <Row gutter={{ xs: 8, sm: 24, md: 150, lg: 24 }}>
            <Col>
              <Button icon={<PlusCircleOutlined />} onClick={() => setIsOpen(true)}>Crear un curso</Button>
            </Col>
            <Col>
              <Button icon={<SyncOutlined />} onClick={getCurso}>Descargar datos</Button>
            </Col>
            <Col>
              <Input
                placeholder="Filtrar por curso"
                value={filterCurso}
                onChange={(e) => setFilterCurso(e.target.value)}
                allowClear
              />
            </Col>
          </Row>
        </Space>
        <Row>
          <Title level={5}>Cantidad : {cursoData.length}</Title>
        </Row>
        <Table
          size="small"
          scroll={{ x: 100 }}
          columns={[
            { title: 'N°', dataIndex: 'numero', width: 10, align: 'center' },
            { title: 'Nemonico', dataIndex: 'nemonico', width: 10 },
            { title: 'Termino', dataIndex: 'termino', width: 10 },
            { title: 'Usuario Última Gestión', dataIndex: 'usuarios_ultima_gestion', width: 20, align: 'center' },
            { title: 'Fecha Última Gestión', dataIndex: 'fecha_actualizacion', width: 20, align: 'center' },
            { title: 'Estado', dataIndex: 'estado', width: 10, align: 'center' },
            {
              title: "Acciones",
              dataIndex: "accion",
              align: 'center',
              width: 10,
              render: (_, record) => (
                <Dropdown overlay={menu(record)} trigger={['click']}>
                  <Button><MenuOutlined /></Button>
                </Dropdown>
              ),
            }
          ]}
          dataSource={cursoData}
        />
      </Card>

      <NewCurso open={isOpenModal} handleCloseModal={() => setIsOpen(false)} getCurso={getCurso} />
      <UpdateCurso open={isOpenUpdateModal} handleCloseModal={() => setIsOpenUpdateModal(false)} formulario={formularioEditar} getCurso={getCurso} />
    </Spin>
  );
};

export default Cursos;
