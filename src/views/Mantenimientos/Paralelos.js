import React,{ useState,useEffect } from "react";
import { Button, Collapse, Input,Row,Col,Space, Table,Typography,Menu,Card,Dropdown, Spin, notification } from "antd";
import { SyncOutlined, PlusCircleOutlined,ClearOutlined,SearchOutlined,EditOutlined,DeleteOutlined,MenuOutlined } from "@ant-design/icons";
import NewParalelo from "../../components/NewParalelo.js"
const Paralelos = () => {
  const { Title } = Typography;
  const [loading,setLoading] = useState(true);
  const [mensajeLoading,setMensajeLoading] = useState("cargando...");
  const [OpenNewModal,setIsOpenNewModal] = useState(false);
  const [dataTabla,setDataTabla] = useState([]);
  const [formularioEditar, setFormularioEditar] = useState([]);
  const [isOpeUpdatePerfil, setIsOpenUpdateModal] = useState(false);
  const url = "http://localhost:8000/api/istg/";

  const mostrarNotificacion = (tipo,titulo,mensaje) => {
    notification[tipo]({
      message: titulo,
      description: mensaje,
    });
  };
  
  function getParalelos(){
    setLoading(true)
    let configuraciones = {
      method:"GET",
      headers:{  
        'Content-Type': 'application/json'
      }
    }

    fetch(`${url}showParalelo`,configuraciones).then((response)=>{
      return response.json();
    }).then((data)=>{
      if(data.data){  
        let data_mapeada = data.data.map((value,index)=>{
          return {
            id:value.id_paralelo,
            numero:index+1,
            paralelo:value.paralelo,
            ip_actualizacion:value.ip_actualizacion,
            fecha_actualizacion:new Date(value.fecha_actualizacion).toLocaleDateString(),
            usuarios_ultima_gestion:value.usuarios_ultima_gestion,
            estado:value.estado
          }
        })

        setDataTabla(data_mapeada)
      }
    }).catch((error) => {
      console.error("Error fetching data:", error); // Debugging line
    }).finally(()=>{
      setLoading(false)
    });

  }

  const deleteParalelo = (values) => {
    console.log("Estoy entrando en la funcion de value");
    console.log(values);

    let request_backend = {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            id_paralelo: values.id  // Asegúrate de que el backend espere este campo
        })
    };

    fetch(`${url}delete_paralelo/${values.id}`, request_backend)  // ID incluido en la URL
        .then((data_request) => data_request.json())
        .then((data) => {
            if (data.ok) {
                mostrarNotificacion("success", "Operación realizada con éxito", "El paralelo " + values.paralelo + " se eliminó con éxito");
            } else if (data.ok === false) {
                mostrarNotificacion("error", "Ha ocurrido un error interno", data.msg);
            }
        })
        .finally(() => {
            getParalelos();
        });
  };

  function handleCloseModal(){
    setIsOpenNewModal(false)
  }
  const handleMenuClick = (action, record) => {
    console.log(`Se hizo clic en "${action}" para el usuario con cédula ${record}`);
    if (action === "editar") {
      setIsOpenUpdateModal(true);
      setFormularioEditar(record);
  } else if (action === "eliminar") {
      deleteParalelo(record);  // Llamar a deleteParalelo cuando se selecciona "eliminar"
  }
  };

  const menu = (record) => (
    <Menu onClick={({ key }) => handleMenuClick(key, record)}>
      <Menu.Item key="editar"><EditOutlined /></Menu.Item>
      <Menu.Item key="eliminar"><DeleteOutlined /></Menu.Item>
    </Menu>
  );
  useEffect(()=>{
    getParalelos()
  },[])
  return (
    <>
    <Spin spinning={loading} tip={mensajeLoading}></Spin>
      <Row style={{
        display:"flex",
        justifyContent:"center"
      }}>
        <Title level={3}>Mantenimiento de Paralelos</Title>
      </Row>
      <Card bordered={false}>

      <Space style={{margin:"5px"}}>
        <Row gutter={{ xs: 8, sm: 24, md: 150, lg: 24 }}>
          <Col>
            <Button icon={<PlusCircleOutlined/>} onClick={()=>{setIsOpenNewModal(true)}}>Crear un paralelo</Button>
          </Col>
          <Col>
            <Button icon={<SyncOutlined/>} onClick={()=>{
              getParalelos()                
            }}>Descargar datos</Button>
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
                dataIndex:'numero',
                title:'numero',
                width:2,
                align:'center'
              },
              {
                dataIndex:'paralelo',
                title:'paralelo',
                width:10,
                align:'center'
              },
              {
                dataIndex:'usuarios_ultima_gestion',
                title:'Usuario ultima gestion',
                width:10,
                align:'center'
              },
              {
                dataIndex:'fecha_actualizacion',
                title:'fecha ultima gestion',
                width:10,
                align:'center'

              },
              {
                dataIndex:'estado',
                title:'Estado',
                width:10,
                align:'center'

              },
              {
                dataIndex: "accion",
                title: "Acciones",
                align:'center',
                width: 10,
                render: (_, record) => (
                  <Dropdown overlay={menu(record)} trigger={['click']}>
                    <Button><MenuOutlined/></Button>
                  </Dropdown>
                ),
              }
          ]}
        dataSource={dataTabla}
      />
      </Card>
      <NewParalelo open={OpenNewModal} handleCloseModal={handleCloseModal} getParalelos={getParalelos} loading={setLoading} mensaje={setMensajeLoading}/>
    </>
  );
}

export default Paralelos;
