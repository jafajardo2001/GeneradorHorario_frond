import React,{ useRef } from "react";
import { Modal, Form, Input, Row, Col, notification } from "antd";


const NewParalelo = (props) => {
  const Formulario = useRef(null);
  const url = "http://localhost:8000/api/istg/";


  const mostrarNotificacion = (tipo, titulo, mensaje) => {
    notification[tipo]({
      message: titulo,
      description: mensaje,
    });
  };

  function createParalelo(value){
    fetch(`${url}create_paralelo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          mostrarNotificacion('success', 'Operación exitosa', data.message);
          props.getParalelos();
          props.handleCloseModal();
        } else {
          mostrarNotificacion('error', 'Error', data.message || 'Error desconocido');
        }
      })
      .catch((error) => {
        mostrarNotificacion('error', 'Error', 'Ocurrió un error: ' + error.message);
      });
  }

  return (
    <Modal onCancel={() => {
          props.handleCloseModal();
          Formulario.current.resetFields();
        }}
        onOk={()=>{
          if(Formulario && Formulario.current){
            Formulario.current.submit();
          }
        }}
        open={props.open} size="large" okText="Guardar" cancelText="Cancelar" title="Nuevo Paralelo">
        <Form onFinish={createParalelo} ref={Formulario} layout="vertical">
          <Row>
            <Col span={24}>
              <Form.Item label="Ingrese el paralelo" rules={
                [
                  {
                    required:true,
                    message:"El campo de paralelo es requerido"
                  }
                ]
              }
              name="paralelo">
                <Input/>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
  );
}
export default NewParalelo;
