import React, { useState, useEffect, useRef } from "react";
import { Button, Col, Row, Form, Table, Spin, Space, Modal, Input, Select, notification } from "antd";
import { ToolOutlined, DeleteOutlined, EditOutlined, SyncOutlined, SaveOutlined, FileAddOutlined } from '@ant-design/icons';

const Materias = () => {
  const [dataAsignatura, setDataAsignatura] = useState([]);
  const url = process.env.REACT_APP_BACKEND_HORARIOS;
  const { Column, ColumnGroup } = Table;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenEdit, setModalOpenEdit] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);
  const formKeyRef = useRef(0);
  const [dataMateriaEdit, setDataMateriaEdit] = useState({});
  const [cursos, setCursos] = useState([]); // Estado para los cursos
  const [filterMateria, setFilterMateria] = useState(""); // Nuevo estado para el filtro
  const [filteredData, setFilteredData] = useState([]); // Inicializado como un array vacío

  const mostrarNotificacion = (tipo, titulo, mensaje) => {
    notification[tipo]({
      message: titulo,
      description: mensaje,
      placement: 'topRight',
    });
  };

  const getAsignatura = () => {
    setLoading(true);
    fetch(`${url}show_data_asignatura/`)
      .then((response) => response.json())
      .then((data_request) => {
        if (data_request.ok) {
          if (data_request.data) {
            let data = data_request.data.map((value, numero) => ({
              key: numero,
              numero: numero + 1,
              id: value.id_materia,
              descripcion: value.descripcion,
              fecha_creacion: new Date(value.fecha_creacion).toLocaleDateString('es-ES'),
              fecha_actualizacion: value.fecha_actualizacion
                ? new Date(value.fecha_actualizacion).toLocaleDateString('es-ES')
                : 'Sin actualización',
              nemonico: value.nemonico,
              termino: value.termino,
              id_nivel: value.id_nivel,
              estado: value?.estado === 'A' ? 'Activo' : 'Inactivo',


            }));

            if (filterMateria) {
              data = data.filter((item) =>
                `${item.descripcion} ${item.termino} ${item.nemonico}`.toLowerCase().includes(filterMateria.toLowerCase())
              );
            }

            setDataAsignatura(data);
            setFilteredData(data);
          } else {
            setDataAsignatura([]);
          }
        } else {
          mostrarNotificacion('error', 'Error', 'Error al obtener las asignaturas');
        }
      })
      .finally(() => setLoading(false))
      .catch(() => {
        mostrarNotificacion('error', 'Error', 'Error interno del servidor');
      });
  };

  const showCursos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}show_nivel/`);
      const data = await response.json();
      if (data.data) {
        const data_mapeada = data.data.map((value) => ({
          value: value.id_nivel,
          label: value.termino,
        }));
        setCursos(data_mapeada);
      }
    } catch (error) {
      mostrarNotificacion("error", "Error", "Error al cargar los cursos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    showCursos();
  }, []);

  const createAsignatura = (value) => {
    setLoadingButton(true);
    const request_op = {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        descripcion: value.descripcion,
        id_nivel: value.nivel
      }),
      method: "POST",
    };

    fetch(`${url}create_asignatura/`, request_op)
      .then((json_data) => json_data.json())
      .then((info_request) => {
        if (info_request.ok) {
          mostrarNotificacion("success", "Operación exitosa", "La materia ha sido creada con éxito.");
        } else {
          mostrarNotificacion("error", "Error al crear materia", info_request.msg_error || 'Error desconocido.');
        }
      })
      .finally(() => {
        getAsignatura();
        form.resetFields();
        setModalOpen(false);
        setLoadingButton(false);
      });
  };

  const actualizarAsignatura = (value) => {
    setLoadingButton(true);
    const data_request = {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion: value.descripcion,
        id_nivel: dataMateriaEdit.id_nivel // Asegúrate de enviar el id_nivel
      }),
    };

    fetch(`${url}update_asignatura/${dataMateriaEdit.id_materia}`, data_request)
      .then((data_json) => data_json.json())
      .then((data) => {
        if (data.ok) {
          mostrarNotificacion('success', 'Modificación exitosa', data.message);
        } else {
          mostrarNotificacion('error', 'Error', data.message || 'Ha ocurrido un error.');
        }
      })
      .finally(() => {
        setModalOpenEdit(false);
        setLoadingButton(false);
        getAsignatura();
      });
  };

  const handleEditarClick = (record) => {
    setDataMateriaEdit({
      key: record.key,
      id_materia: record.id,
      descripcion: record.descripcion,
      id_nivel: record.id_nivel,
      nivel: record.termino,
    });
    setModalOpenEdit(true);
    formKeyRef.current += 1;
  };

  // Verificar distribuciones antes de eliminar
  const verificarDistribuciones = async (id) => {
    try {
      const response = await fetch(`${url}distribuciones_por_materia/${id}`);
      const data = await response.json();
      return data.distribuciones;
    } catch (error) {
      mostrarNotificacion('error', 'Error', 'Error al verificar distribuciones.');
      return false;
    }
  };

  const handleMenuClick = async (action, record) => {
    if (action === "eliminar") {
      const tieneDistribuciones = await verificarDistribuciones(record.id);
      Modal.confirm({
        title: 'Eliminar Asignatura',
        content: tieneDistribuciones
          ? `¿Está seguro de que desea eliminar la asignatura "${record.descripcion}"? Se eliminarán también las distribuciones asociadas.`
          : `¿Está seguro de que desea eliminar la asignatura "${record.descripcion}"? No afectará ninguna distribución.`,
        okText: 'Eliminar',
        cancelText: 'Cancelar',
        onOk: () => deleteAsignatura(record.id),
      });
    } else if (action === "editar") {
      handleEditarClick(record);
    }
  };

  const deleteAsignatura = async (id) => {
    try {
      const response = await fetch(`${url}delete_asignatura/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        mostrarNotificacion('success', 'Operación exitosa', data.message);
        getAsignatura(); // Actualiza la lista de asignaturas
      } else {
        mostrarNotificacion('error', 'Error', data.message || 'No se pudo eliminar la asignatura.');
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error', 'Error al eliminar la asignatura.');
    }
  };

  useEffect(() => {
    getAsignatura();
    showCursos();
  }, [filterMateria]);

  return (
    <Spin spinning={loading} tip="Cargando...">
      <>
        <Modal title="Crear Materia" footer={null} open={modalOpen} onCancel={() => setModalOpen(false)}>
          <Row align="left" style={{ marginLeft: "10px" }}>
            <h2><FileAddOutlined />Crear Materia</h2>
          </Row>
          <Row>
            <Form form={form} onFinish={createAsignatura} layout="vertical" autoComplete="on" align="left">
              <Row>
                <Form.Item name="descripcion" rules={[{ required: true, message: "La descripcion es requerido" }]} label="Ingrese la descripcion">
                  <Input style={{ width: 450 }} />
                </Form.Item>
              </Row>
              <Col span={24}>
                <Form.Item label="Escoja el periodo" name="nivel" rules={[{ required: true, message: "Debe seleccionar un periodo" }]}>
                  <Select options={cursos} />
                </Form.Item>
              </Col>
              <Row>
                <Button htmlType="submit" style={{ width: "100%" }} type="primary" icon={<SaveOutlined />} loading={loadingButton}>Crear Materia</Button>
              </Row>
            </Form>
          </Row>
        </Modal>

        <Modal key={formKeyRef.current} title="Editar Materia" footer={null} open={modalOpenEdit} onCancel={() => setModalOpenEdit(false)}>
          <Row align="left" style={{ marginLeft: "10px" }}>
            <h2><FileAddOutlined />Editar Materia</h2>
          </Row>
          <Row>
            <Form initialValues={dataMateriaEdit} onFinish={actualizarAsignatura} layout="vertical" autoComplete="on" align="left">
              <Row>
                <Form.Item name="descripcion" rules={[{ required: true, message: "La descripcion es requerido" }]} label="Ingrese la descripcion">
                  <Input style={{ width: 450 }} />
                </Form.Item>
              </Row>
              <Form.Item label="Nivel" name="nivel" rules={[{ required: true, message: "Este campo es obligatorio" }]}>
                <Select options={cursos} placeholder="Seleccione un curso" />
              </Form.Item>
              <Row>
                <Button htmlType="submit" style={{ width: "100%" }} type="primary" icon={<SaveOutlined />} loading={loadingButton}>Editar Materia</Button>
              </Row>
            </Form>
          </Row>
        </Modal>

        <Row align="center">
          <ToolOutlined style={{ fontSize: "25px" }} /><h1>Mantenimiento de Materias</h1>
        </Row>

        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Row align="left">
            <Space size="small">
              <Col>
                <Button icon={<EditOutlined />} onClick={() => setModalOpen(true)}>Crear una nueva materia</Button>
              </Col>
              <Col>
                <Button icon={<SyncOutlined />} onClick={getAsignatura}>Sincronizar datos</Button>
              </Col>
              <Col>
                <Input placeholder="Filtrar por Materia" value={filterMateria} onChange={(e) => setFilterMateria(e.target.value)} allowClear />
              </Col>
            </Space>
          </Row>

          <Row style={{ width: '100%' }}>
            <Table scroll={{ x: 1745 }} dataSource={dataAsignatura}>
              <ColumnGroup title="Registro" align="center">
                <Column title="Descripción" dataIndex="descripcion" width={50} align="center" />
                <Column title="Término" dataIndex="termino" width={50} align="center" />
              </ColumnGroup>
              <ColumnGroup title="Campos de auditoría" bordered align="center">
                <Column title="Fecha de Creación" dataIndex="fecha_creacion" width={50} align="center" />
                <Column title="Fecha de Actualización" dataIndex="fecha_actualizacion" width={50} align="center" />
                <Column title="Estado" dataIndex="estado" width={40} align="center" />

              </ColumnGroup>
              <Column
                title="Acciones"
                fixed="right"
                width={60}
                dataIndex="acciones"
                align="center"
                render={(_, record) => (
                  <Space size="small">
                    <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditarClick(record)} />
                    <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => handleMenuClick("eliminar", record)} />
                  </Space>
                )}
              />
            </Table>
          </Row>
        </Space>
      </>
    </Spin>
  );
};

export default Materias;
