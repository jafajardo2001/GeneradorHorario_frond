import React, { useState, useEffect } from "react";
import { Button, Card, Row, Col, Space, Table, Typography, Menu, Dropdown, Spin, Input, notification, Modal } from "antd";
import { SyncOutlined, FileAddOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons";
import NewPeriodo from "../../components/NewPeriodo.js";
import UpdatePeriodo from "../../components/UpdatePeriodo.js";

const PeriodoElectivo = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(true);
  const [mensajeLoading, setMensajeLoading] = useState("cargando...");
  const [periodosData, setPeriodos] = useState([]);
  const [isOpenNewPeriodo, setIsOpenNewModal] = useState(false);
  const [isOpenUpdatePeriodo, setIsOpenUpdateModal] = useState(false);
  const [formularioEditar, setFormularioEditar] = useState({});
  const [filterPeriodo, setFilterPeriodo] = useState(""); // Nuevo estado para el filtro
  const url = "http://localhost:8000/api/istg/";

  useEffect(() => {
    getPeriodos();
  }, [filterPeriodo]);

  const handleCloseModal = () => {
    setIsOpenNewModal(false);
    setIsOpenUpdateModal(false);
    setFormularioEditar({}); // Limpiar el formulario al cerrar
  };

  const mostrarNotificacion = (tipo, titulo, mensaje) => {
    notification[tipo]({
      message: titulo,
      description: mensaje,
    });
  };

  const getPeriodos = () => {
    setLoading(true);
    fetch(`${url}show_data_periodo_electivo`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        if (data.data) {
          let periodos = data.data.map((value, index) => {
            return {
              numero: index + 1,
              id: value?.id_periodo,
              anio: value?.anio,
              periodo: value?.periodo,
              fecha_creacion: new Date(value.fecha_creacion).toLocaleDateString(),
              fecha_actualizacion: value?.fecha_actualizacion
                ? new Date(value?.fecha_actualizacion).toLocaleDateString()
                : 'N/A',
              estado: value?.estado === 'A' ? 'Activo' : 'Inactivo'
            };
          });

          // Filtrar datos, excluyendo los que están en estado 'E' (Eliminado)
          periodos = periodos.filter(item => item.estado !== 'Inactivo');

          // Filtrar adicionalmente por el término de búsqueda (filterPeriodo)
          if (filterPeriodo) {
            periodos = periodos.filter(item =>
              item.año.toLowerCase().includes(filterPeriodo.toLowerCase()) ||
              item.periodo.toLowerCase().includes(filterPeriodo.toLowerCase())
            );
          }

          setPeriodos(periodos);
        }
      })
      .catch(() => {
        setPeriodos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleMenuClick = (action, record) => {
    console.log(`Se hizo clic en "${action}" para el periodo con ID ${record.id}`);
  
    if (action === "editar") {
      setIsOpenUpdateModal(true);
      setFormularioEditar(record);
    }
  
    if (action === "eliminar") {
      // Verificar si hay distribuciones asociadas al periodo
      fetch(`${url}distribuciones_por_periodo/${record.id}`) // Asegúrate de que esta ruta sea la correcta en tu backend
        .then((response) => response.json())
        .then((data) => {
          if (data.ok && data.count > 0) {
            // Si hay distribuciones asociadas
            Modal.confirm({
              title: 'Eliminar Periodo Electivo',
              content: `¿Está seguro de que desea eliminar el periodo "${record.anio} - ${record.periodo}"? Esto también inhabilitará las distribuciones asociadas.`,
              okText: 'Eliminar',
              cancelText: 'Cancelar',
              onOk: () => deletePeriodoElectivo(record),
            });
          } else {
            // Si no hay distribuciones asociadas
            Modal.confirm({
              title: 'Eliminar Periodo Electivo',
              content: `¿Está seguro de que desea eliminar el periodo "${record.anio} - ${record.periodo}"? Esta acción no afectará otras partes del sistema.`,
              okText: 'Eliminar',
              cancelText: 'Cancelar',
              onOk: () => deletePeriodoElectivo(record),
            });
          }
        })
        .catch((error) => {
          console.error("Error al verificar distribuciones:", error);
          mostrarNotificacion('error', 'Error', 'Error al verificar las distribuciones asociadas.');
        });
    }
  };
  
  const deletePeriodoElectivo = async (record) => {
    try {
      const response = await fetch(`${url}delete_periodo_electivo/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        mostrarNotificacion('success', 'Eliminación exitosa', `El periodo "${record.anio} - ${record.periodo}" se eliminó con éxito.`);
        getPeriodos(); // Recargar la lista de periodos
      } else {
        mostrarNotificacion('error', 'Error', data.message || 'No se pudo eliminar el periodo.');
      }
    } catch (error) {
      console.error("Error al eliminar el periodo:", error);
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
    <>
      <Spin spinning={loading} tip={mensajeLoading}>
        <Row style={{ display: "flex", justifyContent: "center" }}>
          <Title level={3}>Mantenimiento de Periodos Electivos</Title>
        </Row>

        <Card bordered={false}>
          <Space style={{ margin: "5px" }}>
            <Row gutter={{ xs: 8, sm: 24, md: 150, lg: 24 }}>
              <Col>
                <Button icon={<FileAddOutlined />} onClick={() => { setIsOpenNewModal(true) }} type="primary">
                  Crear Periodo Electivo
                </Button>
              </Col>

              <Col>
                <Button icon={<SyncOutlined />} onClick={getPeriodos}>
                  Descargar datos
                </Button>
              </Col>
              <Col>
                <Input
                  placeholder="Filtrar por Año o Periodo"
                  value={filterPeriodo}
                  onChange={(e) => setFilterPeriodo(e.target.value)}
                  allowClear
                />
              </Col>
            </Row>
          </Space>
          <Row>
            <Title level={5}>Cantidad : {periodosData.length}</Title>
          </Row>
          <Table
            size="small"
            scroll={{ x: 100 }}
            style={{ margin: "5px" }}
            dataSource={periodosData}
            columns={[
              {
                dataIndex: 'numero',
                title: 'Nº',
                width: 20,
                align: 'center'
              },
              {
                dataIndex: 'anio',
                title: 'Año',
                width: 50,
                align: 'center'
              },
              {
                dataIndex: 'periodo',
                title: 'Periodo',
                width: 50,
                align: 'center'
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
      <NewPeriodo open={isOpenNewPeriodo} handleCloseModal={handleCloseModal} getPeriodos={getPeriodos} />
      <UpdatePeriodo open={isOpenUpdatePeriodo} handleCloseModal={handleCloseModal} getPeriodos={getPeriodos} formulario={formularioEditar} loading={setLoading} mensaje={setMensajeLoading} />
    </>
  );
};


export default PeriodoElectivo;
