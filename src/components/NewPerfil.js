import React,{useRef} from "react";
import { Modal,Form,Input,Row,Col,Typography } from "antd";
const NewPerfil = (props) => {
  const { Title } = Typography;
  const Formulario = useRef(null);
  const url = "http://localhost:8000/api/istg/";
<<<<<<< HEAD
  function createPerfil(value){
    fetch(`${url}create_rol`, { method: 'POST',headers: {'Content-Type': 'application/json'},body: JSON.stringify({
            descripcion:value.descripcion
          }),
        }).then((response) => {
            return response.json();
          }).then((data) => {
            window.alert(data.message)
            if(data.ok){
              props.getRoles()
            }
            window.alert(props.message)
            Formulario.current.resetFields();
            props.handleCloseModal();
          }).catch((error) => {
            window.alert('A ocurrido un error:' + error);
          });
  }
  return (
      <Modal onCancel={() => {
          props.handleCloseModal();
        }}
        onOk={()=>{
          if(Formulario && Formulario.current){
            Formulario.current.submit();
          }
        }}
        open={props.open} size="large" okText="Guardar" cancelText="Cancelar" title="Nuevo Perfil">
        <Form onFinish={createPerfil} ref={Formulario} layout="vertical" title="Nuevo perfil">
          <Row>
            <Col span={24}>
              <Form.Item label="Ingrese el nombre del perfil" rules={
                [
                  {
                    required:true,
                    message:"El campo del nombre del perfil es requerido"
                  }
                ]
              }
              name="descripcion">
                <Input/>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
}
=======

  const openNotification = (type, message, description) => {
    notification[type]({
      message: message,
      description: description,
      placement: 'topRight',
    });
  };

  const handleSuccess = () => {
    openNotification('success', 'Perfil creado', 'El perfil ha sido creado con éxito.');
  };

  const handleError = (message) => {
    openNotification('error', 'Error', message);
  };

  function createPerfil(value) {
    fetch(`${url}create_rol`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion: value.descripcion,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          handleSuccess();
          props.getRoles();
          Formulario.current.resetFields();
          props.handleCloseModal();
        } else {
          handleError(data.mensaje || 'Error al crear el perfil');
        }
      })
      .catch((error) => {
        handleError('Ha ocurrido un error: ' + error.message);
      });
  }

  return (
    <Modal
      onCancel={() => {
        props.handleCloseModal();
      }}
      onOk={() => {
        if (Formulario && Formulario.current) {
          Formulario.current.submit();
        }
      }}
      open={props.open}
      size="large"
      okText="Guardar"
      cancelText="Cancelar"
      title="Nuevo Perfil"
    >
      <Form onFinish={createPerfil} ref={Formulario} layout="vertical">
        <Row>
          <Col span={24}>
            <Form.Item
              label="Ingrese el nombre del perfil"
              rules={[
                {
                  required: true,
                  message: "El campo del nombre del perfil es requerido",
                },
              ]}
              name="descripcion"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
>>>>>>> parent of 7159411 (Merge branch 'moises_frond')

export default NewPerfil;
