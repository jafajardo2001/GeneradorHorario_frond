import React, { useState, useEffect } from "react";
import {
  Button,
  Collapse,
  Input,
  Row,
  Col,
  Space,
  Table,
  Typography,
  Menu,
  Card,
  Dropdown,
  Spin,
  notification,
  Modal
} from "antd";
import {
  SyncOutlined,
  PlusCircleOutlined,
  ClearOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import NewParalelo from "../../components/NewParalelo.js";
import UpdateParalelo from "../../components/UpdateParalelo.js"
const Paralelos = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(true);
  const [mensajeLoading, setMensajeLoading] = useState("cargando...");
  const [OpenNewModal, setIsOpenNewModal] = useState(false);
  const [dataTabla, setDataTabla] = useState([]);
  const [formularioEditar, setFormularioEditar] = useState([]);
  const [isOpeUpdatePerfil, setIsOpenUpdateModal] = useState(false);
  const [filterParalelo, setFilterParalelo] = useState(""); // Nuevo estado para el filtro
  const [filteredData, setFilteredData] = useState([]); // Inicializado como un array vacío
  const url = "http://localhost:8000/api/istg/";

  const mostrarNotificacion = (tipo, titulo, mensaje) => {
    notification[tipo]({
      message: titulo,
      description: mensaje,
    });
  };

  function getParalelos() {
    setLoading(true);
    let configuraciones = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    fetch(`${url}showParalelo`, configuraciones)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.data) {
          let Paralelo = data.data.map((value, index) => {
            return {
              id: value.id_paralelo,
              numero: index + 1,
              paralelo: value.paralelo,
              ip_actualizacion: value.ip_actualizacion,
              fecha_actualizacion: new Date(
                value.fecha_actualizacion
              ).toLocaleDateString(),
              usuarios_ultima_gestion: value.usuarios_ultima_gestion,
              estado: value.estado,
            };
          });
          // Aplicar el filtro en el array 'Paralelo', no en 'data'
          const filtered = Paralelo.filter((item) =>
            item.paralelo.toLowerCase().includes(filterParalelo.toLowerCase())
          );
          setDataTabla(filtered); // Usa los datos filtrados para la tabla
          setFilteredData(filtered); // Guarda los datos filtrados
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const checkDistribucionesParalelo = async (id) => {
    try {
      const response = await fetch(`${url}distribuciones_por_paralelo/${id}`);
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
    console.log(`Se hizo clic en "${action}" para el paralelo con ID ${record.id}`);
    if (action === "eliminar") {
      const hasDistribuciones = await checkDistribucionesParalelo(record.id); // Verificamos si hay distribuciones

      const content = hasDistribuciones
        ? `¿Está seguro de que desea eliminar el paralelo "${record.paralelo}"? Esta acción eliminará también las distribuciones asociadas.`
        : `¿Está seguro de que desea eliminar el paralelo "${record.paralelo}"? Esta acción no afectará al sistema.`;

      Modal.confirm({
        title: 'Eliminar Paralelo',
        content,
        okText: 'Eliminar',
        cancelText: 'Cancelar',
        onOk: () => deleteParalelo(record.id), // Eliminar paralelo si se confirma
      });
    } else if (action === "editar") {
      setIsOpenUpdateModal(true);
      setFormularioEditar(record);
    }
  };

  const deleteParalelo = (id) => {
    fetch(`${url}delete_paralelo/${id}`, { method: 'PUT' })
      .then(response => response.json())
      .then(data => {
        if (data.ok) {
          mostrarNotificacion('success', 'Operación realizada con éxito', `El paralelo se eliminó con éxito.`);
          getParalelos(); // Recargar paralelos después de eliminar
        } else {
          mostrarNotificacion('error', 'Error', data.message || 'No se pudo eliminar el paralelo.');
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
  useEffect(() => {
    getParalelos();
  }, [filterParalelo]);


  return (
    <>
      <Spin spinning={loading} tip={mensajeLoading}></Spin>
      <Row
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Title level={3}>Mantenimiento de Paralelos</Title>
      </Row>
      <Card bordered={false}>
        <Space style={{ margin: "5px" }}>
          <Row gutter={{ xs: 8, sm: 24, md: 150, lg: 24 }}>
            <Col>
              <Button
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  setIsOpenNewModal(true);
                }}
              >
                Crear un paralelo
              </Button>
            </Col>
            <Col>
              <Button
                icon={<SyncOutlined />}
                onClick={() => {
                  getParalelos();
                }}
              >
                Descargar datos
              </Button>
            </Col>
            <Col>
              <Input
                placeholder="Filtrar por Paralelo"
                value={filterParalelo}
                onChange={(e) => setFilterParalelo(e.target.value)}
                allowClear
              />
            </Col>
          </Row>
        </Space>
        <Row>
          <Title level={5}>Cantidad : {dataTabla.length}</Title>
        </Row>

        <Table
          size="small"
          scroll={{ x: 100 }}
          columns={[
            {
              dataIndex: "numero",
              title: "numero",
              width: 2,
              align: "center",
            },
            {
              dataIndex: "paralelo",
              title: "paralelo",
              width: 10,
              align: "center",
            },
            {
              dataIndex: "usuarios_ultima_gestion",
              title: "Usuario ultima gestion",
              width: 10,
              align: "center",
            },
            {
              dataIndex: "fecha_actualizacion",
              title: "fecha ultima gestion",
              width: 10,
              align: "center",
            },
            {
              dataIndex: "estado",
              title: "Estado",
              width: 10,
              align: "center",
            },
            {
              dataIndex: "accion",
              title: "Acciones",
              align: "center",
              width: 10,
              render: (_, record) => (
                <Dropdown overlay={menu(record)} trigger={["click"]}>
                  <Button>
                    <MenuOutlined />
                  </Button>
                </Dropdown>
              ),
            },
          ]}
          dataSource={dataTabla}
        />
      </Card>
      <NewParalelo
        open={OpenNewModal}
        handleCloseModal={() => setIsOpenNewModal(false)}
        getParalelos={getParalelos}
        loading={setLoading}
        mensaje={setMensajeLoading}
      />
      <UpdateParalelo open={isOpeUpdatePerfil} handleCloseModal={() => setIsOpenUpdateModal(false)} formulario={formularioEditar} getParalelos={getParalelos} loading={setLoading} mensaje={setMensajeLoading} />
    </>
  );
};

export default Paralelos;
