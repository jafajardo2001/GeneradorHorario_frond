import React,{useState,useEffect, useRef} from "react";
import { Button, Col, Row,Form, Flex, Breadcrumb, Table, Popconfirm,Spin,Space,Modal,Input,notification } from "antd";
import FormItem from "antd/es/form/FormItem";

import { ToolOutlined, QuestionCircleOutlined, DeleteOutlined, EditOutlined, SyncOutlined,SaveOutlined,FileAddOutlined } from '@ant-design/icons';

const Materias = () => {

  const [dataAsignatura,setDataAsignatura] = useState([]);
  const url = process.env.REACT_APP_BACKEND_HORARIOS;
  //const url = "http://127.0.0.1:8000/api/v1/horario/";
  const { Column, ColumnGroup } = Table;
  const [modalOpen,setModalOpen] = useState(false);
  const [modalOpenEdit,setModalOpenEdit] = useState(false);
  const [form] = Form.useForm();
  const [loading,setLoading]= useState(true);
  const [loadingButton,setLoadingButton]= useState(false);
  const formKeyRef = useRef(0);
  const [modalOpenTitulo,setModalOpenTitulo] = useState(false);
  const [dataMateriaEdit,setDataMateriaEdit] = useState({});
  const [id_materia,setIdMateria] = useState(0);
  const [filterMateria, setFilterMateria] = useState(""); // Nuevo estado para el filtro
  const [filteredData, setFilteredData] = useState([]); // Inicializado como un array vacío
  const mostrarNotificacion = (tipo,titulo,mensaje) => {
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
        console.log("Soy la data request");
        console.log(data_request);
        if (data_request.ok) {
          if (data_request.data) {
            let data = data_request.data.map((value, numero) => ({
              key: numero,
              numero: numero + 1,
              id: value.id_materia,
              id_materia: value.id_materia, // Guardar ID sin JSX
              descripcion: value.descripcion, // Guardar descripción sin JSX
              fecha_creacion: new Date(value.fecha_creacion).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }),
              fecha_actualizacion: value.fecha_actualizacion
                ? new Date(value.fecha_actualizacion).toLocaleDateString('es-ES')
                : 'Este registro no tiene fecha de actualizacion',
              estado: value.estado === 'A'
                ? 'Activo'
                : value.estado === 'I'
                ? 'Inactivo'
                : value.estado === 'E'
                ? 'Eliminado'
                : 'Otra condición',
            }));
  
            // Aplicar filtro en los datos sin JSX
            if (filterMateria) {
              data = data.filter((item) =>
                item.descripcion.toLowerCase().includes(filterMateria.toLowerCase())
              );
            }
  
            // Transformar datos a JSX para la tabla
            const dataConJSX = data.map((item) => ({
              ...item,
              id_materia: <label className="letra-pequeña1">{item.id_materia}</label>,
              descripcion: <label className="letra-pequeña1">{item.descripcion}</label>,
              fecha_creacion: <span className="letra-pequeña1">{item.fecha_creacion}</span>,
              fecha_actualizacion: (
                <label className="letra-pequeña1">{item.fecha_actualizacion}</label>
              ),
            }));
  
            setDataAsignatura(dataConJSX);
            setFilteredData(dataConJSX);
          } else {
            setDataAsignatura([]);
          }
        } else if (!data_request.ok) {
          mostrarNotificacion('error', 'A ocurrido un error', 'A ocurrido un error al obtener la informacion');
        }
      })
      .finally(() => {
        setLoading(false);
      })
      .catch(() => {
        mostrarNotificacion('error', 'A ocurrido un error', 'Error interno en el servidor');
      });
  };
  
  
  const createAsignatura = (value) => {
    setLoadingButton(true);

    const request_op = {
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(value),
      method: "POST",
    }

    fetch(`${url}create_asignatura/`, request_op)
        .then((json_data) => json_data.json())
        .then((info_request) => {
            if (info_request.ok) {
              mostrarNotificacion("success", "Operación exitosa", "La materia ha sido creada con éxito.");
            } else {
                // Asegúrate de que `info_request.msg_error` está correctamente definido en el backend.
                mostrarNotificacion("error", "Error al crear materia", info_request.msg_error || 'Error desconocido.');
            }
          })
          .catch((error) => {
            mostrarNotificacion("error", "Error en la solicitud", error.message);
          })
          .finally(() => {
            getAsignatura();
            form.resetFields();
            setModalOpen(false);
            setLoadingButton(false);
        });
}




const actualizarAsignatura = (value) => {
  setLoadingButton(true);

  let data_request = {
    method: "PUT",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_materia: dataMateriaEdit.id_materia, ...value }),
  };

  fetch(`${url}update_asignatura/${dataMateriaEdit.id_materia}`, data_request)
    .then((data_json) => {
      return data_json.json();
    })
    .then((data) => {
      if (data.ok) {
        mostrarNotificacion('success', 'Modificación exitosa', data.message);
      } else {
        // Mostrar notificación de error si la descripción ya existe o cualquier otro error
        mostrarNotificacion('error', 'Error', data.message || 'Ha ocurrido un error.');
      }
    })
    .catch((error) => {
      mostrarNotificacion('error', 'Error', error.message);
    })
    .finally(() => {
      setModalOpenEdit(false);
      setLoadingButton(false);
      getAsignatura();
    });
};


  const handleEditarClick = (childrens) => {
    setDataMateriaEdit({
        key: childrens.key,
        id_materia: childrens.id, // Cambiado a id_materia para coincidir con la API
        descripcion: childrens.descripcion.props.children // Asegúrate de que `descripcion` está correctamente pasado
    });
    setModalOpenEdit(true); // Asegúrate de que esto se esté llamando correctamente
    formKeyRef.current += 1; // Esto es correcto para forzar la actualización del formulario
  };


  const deleteTitulo = (values) => {
    console.log("Estoy entrando en la funcion de value");
    console.log(values);

    let request_backend = {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            id_materia: values.id  // Asegúrate de que el backend espere este campo
        })
    };

    fetch(`${url}delete_asignatura/${values.id}`, request_backend)  // ID incluido en la URL
        .then((data_request) => data_request.json())
        .then((data) => {
            if (data.ok) {
                mostrarNotificacion("success", "Operación realizada con éxito", "La materia " + values.descripcion.props.children + " se eliminó con éxito");
            } else if (data.ok === false) {
                mostrarNotificacion("error", "Ha ocurrido un error interno", data.msg);
            }
        })
        .finally(() => {
            getAsignatura();
        });
};






  useEffect(()=>{
    getAsignatura();
  },[filterMateria])
  return (
    <Spin spinning={loading} tip="Cargando...">
      <>
        <Modal title="Crear Materia" footer={null} open={modalOpen} onCancel={()=>{setModalOpen(false)}} onclose={()=>{setModalOpen(false)}}>
          <Row align="left" style={{marginLeft:"10px"}}>
            <h2><FileAddOutlined />Crear Materia</h2>
          </Row>
          <Row>
            <Form form={form} onFinish={createAsignatura} layout="vertical" autoComplete="on" align="left">
              
              
              <Row>
                <Form.Item name="descripcion" rules={[{required:true,message:"La descripcion es requerido"}]} label="Ingrese la descripcion" >
                  <Input style={{ width: 450 }}/>
                </Form.Item>
              </Row>

              <Row>
                <Button htmlType="submit" style={{width:"100%"}} type="primary" icon={<SaveOutlined />} loading={loadingButton}>Crear Materia</Button>
              </Row>
            </Form>
          </Row>
        </Modal>



        <Modal key={formKeyRef.current} title="Editar Materia" footer={null} open={modalOpenEdit} onCancel={()=>{setModalOpenEdit(false)}} onclose={()=>{setModalOpenEdit(false)}} >
          <Row align="left" style={{marginLeft:"10px"}}>
            <h2><FileAddOutlined />Editar Materia</h2>
          </Row>
          <Row>
            <Form initialValues={dataMateriaEdit} onFinish={actualizarAsignatura} layout="vertical" autoComplete="on" align="left">
              
              
              <Row>
                <Form.Item name="descripcion" rules={[{required:true,message:"La descripcion es requerido"}]} label="Ingrese la descripcion" >
                  <Input style={{ width: 450 }}/>
                </Form.Item>
              </Row>

              <Row>
                <Button htmlType="submit" style={{width:"100%"}} type="primary" icon={<SaveOutlined />} loading={loadingButton}>Editar Materia</Button>
              </Row>
            </Form>
          </Row>
      </Modal>



        <Row align="center">
          <Flex wrap="wrap" grap="small" >
            <ToolOutlined style={{ fontSize: "25px" }} /><h1>Mantenimiento de Materias</h1>
          </Flex>
        </Row>

        
        
        <Space direction="vertical" size={20} style={{ width: "100%" }}>
          <Row align="left" layout>
            <Space size="small">
              <Col>
                <Button style={{ color: "green", border: "1px solid green" }} icon={<EditOutlined />} onClick={()=>{setModalOpen(true)}}>Crear una nueva materia</Button>
              </Col>
              <Col>
                <Button style={{ color: "green", border: "1px solid green" }} icon={<SyncOutlined />} onClick={()=>{getAsignatura()}}>Sincronizar datos</Button>
              </Col>
              <Col>
                        <Input 
                            placeholder="Filtrar por Materia" 
                            value={filterMateria} 
                            onChange={(e) => setFilterMateria(e.target.value)} 
                            allowClear 
                        />
                    </Col>
            </Space>

          </Row>

          <Row style={{ width: '100%' }}>
            <Table scroll={{ x: 1745 }}
               dataSource={dataAsignatura}
              >
              <ColumnGroup title="Registro" align="center">
                <Column title="Descripción" dataIndex="descripcion" width={80} align="center" />
              </ColumnGroup>
              <ColumnGroup title="Campos de auditoria" bordered={true} align="center">
                <Column title="fecha de creacion" dataIndex="fecha_creacion" width={90} align="center" />
                <Column title="Fecha de actualizacion" dataIndex="fecha_actualizacion" width={90} align="center" />
                <Column title="Estado registro" dataIndex="estado" width={100} align="center" />
              </ColumnGroup>
            <Column
            title="Acciones"
            fixed="right"
            width={75}
            dataIndex="acciones"
            align="center"
            
            render={(childrens, record) => (
              <Space size="small">
                <Col>
                  <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditarClick(record)}/>
                </Col>
                <Col>
                  <Popconfirm
                    okText="Si, realizar"
                    title="Confirmar accion"
                    description="¿Deseas realizar la eliminacion de este registro? Al borrar este registro, todos los usuarios que tengan el título académico de este registro quedarán afectados."
                    onConfirm={() => { deleteTitulo(record) }}
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}>
                    <Button type="primary" danger icon={<DeleteOutlined />}/>
                  </Popconfirm>
                </Col>
              </Space>
            )}
            
          />
            </Table>
          </Row>
        </Space>


      </>
    </Spin>
    );
}
export default Materias;
