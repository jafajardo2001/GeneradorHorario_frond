import React,{ useState,useEffect } from "react";
import { Button, Collapse, Input, Table,Typography,Menu,Dropdown,Row,Col,Space,Card, Spin, notification } from "antd";
import { SyncOutlined, PlusCircleOutlined,ClearOutlined,SearchOutlined,EditOutlined,DeleteOutlined,MenuOutlined } from "@ant-design/icons";
import NewCurso from "../../components/NewCurso.js"
import UpdateCurso from "../../components/UpdateCurso.js"
const Cursos = () => {
  const { Title } = Typography;
  const [loading,setLoading] = useState(true);
  const [mensajeLoading,setMensajeLoading] = useState("cargando...");
  const [isOpenModal,setIsOpen] = useState(false);
  const [isOpenUpdateModal,setIsOpenUpdateModal] = useState(false);
  const [cursoData,setCursoData] = useState([]);
  const [formularioEditar,setFormularioEditar] = useState([]);
  const url = "http://localhost:8000/api/istg/";
  useEffect(()=>{
    getCurso()
  },[])
  const mostrarNotificacion = (tipo,titulo,mensaje) => {
    notification[tipo]({
      message: titulo,
      description: mensaje,
    });
  };
  function getCurso(){
    setLoading(true)
    fetch(`${url}show_nivel`, { method: 'GET' })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            let curso = data.data.map((value,index)=>{
              return {
                id:value.id_nivel,
                numero:value.numero,
                nemonico:value.nemonico,
                termino:value.termino,
                ip_actualizacion:value.ip_actualizacion,
                fecha_actualizacion:new Date(value.fecha_actualizacion).toLocaleDateString(),
                usuarios_ultima_gestion:value.usuarios_ultima_gestion,
                estado:value.estado
              }
            })

            setCursoData(curso)

          }).catch((error) => {
            console.error("Error fetching data:", error); // Debugging line
          }).finally(()=>{
            setLoading(false)
          });

  }
  const deleteCurso = (values) => {
    console.log("Estoy entrando en la funcion de value");
    console.log(values);

    let request_backend = {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            id_nivel: values.id  // Asegúrate de que el backend espere este campo
        })
    };

    fetch(`${url}delete_nivel/${values.id}`, request_backend)  // ID incluido en la URL
        .then((data_request) => data_request.json())
        .then((data) => {
            if (data.ok) {
                mostrarNotificacion("success", "Operación realizada con éxito", "El curso " + values.termino + " se eliminó con éxito");
            } else if (data.ok === false) {
                mostrarNotificacion("error", "Ha ocurrido un error interno", data.msg);
            }
        })
        .finally(() => {
          getCurso();
        });
  };
  const menu = (record) => (
            <Menu onClick={({ key }) => handleMenuClick(key, record)}>
                <Menu.Item key="editar"><EditOutlined/></Menu.Item>
                <Menu.Item key="eliminar"><DeleteOutlined/></Menu.Item>
            </Menu>
    );

  const handleMenuClick = (action, record) => {
        console.log(`Se hizo clic en "${action}" para el usuario con cédula ${record}`);
        if(action == "editar"){
          setIsOpenUpdateModal(true)
          setFormularioEditar(record)
        }
        else if (action === "eliminar") {
          deleteCurso(record);  // Llamar a deleteParalelo cuando se selecciona "eliminar"
      }
    };

  function handleCloseModal(){
    setIsOpen(false)
    setIsOpenUpdateModal(false)
  }

  return (
    <>
    <Spin spinning={loading} tip={mensajeLoading}></Spin>
      <Row style={{
        display:"flex",
        justifyContent:"center"
      }}>
        <Title level={3}>Mantenimiento de Cursos</Title>
      </Row>
      <Card bordered={false}>
      <Space style={{
          margin:"5px"
        }} direction="vertical">
          <Row gutter={{ xs: 8, sm: 24, md: 150, lg: 24 }}>
            <Col>
              <Button icon={<PlusCircleOutlined/>} onClick={()=>{setIsOpen(true)}}>Crear un curso</Button>
            </Col>
            <Col>
              <Button icon={<SyncOutlined/>} onClick={()=>{
                getCurso()
              }}>Descargar datos</Button>
            </Col>
          </Row>
      
      </Space>
      <Row>
        <Title level={5}>Cantidad : {cursoData.length}</Title>
      </Row>
      <Table
        size="small"
        scroll={{ x: 100, y:1500 }}  
        columns={[
              {
                dataIndex:'numero',
                title:'numero',
                width:10,
                align:'center'
              },
              {
                dataIndex:'nemonico',
                title:'nemonico',
                width:10
              },
              {
                dataIndex:'termino',
                title:'termino',
                width:10
              },
              {
                dataIndex:'usuarios_ultima_gestion',
                title:'Usuario ultima gestion',
                width:20,
                align:'center'
              },
              {
                dataIndex:'fecha_actualizacion',
                title:'fecha ultima gestion',
                width:20,
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
        dataSource={cursoData}
      />
    </Card>

    <NewCurso open={isOpenModal} handleCloseModal={handleCloseModal} getCurso={getCurso}/>
    <UpdateCurso open={isOpenUpdateModal} handleCloseModal={handleCloseModal} formulario={formularioEditar} getCurso={getCurso} loading={setLoading} mensaje={setMensajeLoading}/>
    </>
  );
}
export default Cursos;
