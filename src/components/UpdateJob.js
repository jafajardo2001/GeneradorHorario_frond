import React, { useRef, useEffect, useState } from "react";
import { Modal, Form, Col, Row, Input, notification } from "antd";

const UpdateJob = (props) => {
  const formRef = useRef(null);
  const [id, setId] = useState(0);
  const url = "http://localhost:8000/api/istg/";

  const update = (value) => {
    fetch(`${url}update_job/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(value),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          notification.success({
            message: 'Actualización Exitosa',
            description: data.message || 'Trabajo actualizado correctamente.',
            placement: 'topRight',
          });
          formRef.current.resetFields();
          props.handleCloseModal();
          props.getJobs(); // Asegúrate de que esta función obtenga los trabajos actualizados
        } else {
          notification.error({
            message: 'Error',
            description: data.message || 'No se pudo actualizar el trabajo.',
            placement: 'topRight',
          });
        }
      })
      .catch((error) => {
        notification.error({
          message: 'Error',
          description: 'Ocurrió un error al actualizar el trabajo: ' + error.message,
          placement: 'topRight',
        });
      });
  };

  useEffect(() => {
    if (formRef.current) {
      setId(props.formulario.id);
      formRef.current.setFieldsValue(props.formulario);
    }
  }, [props.formulario]);

  return (
    <>
      <Modal 
        onCancel={() => {
          props.handleCloseModal();
        }}
        onOk={() => {
          if (formRef && formRef.current) {
            formRef.current.submit();
          }
        }}
        open={props.open} 
        title="Actualizar el trabajo" 
        okText="Actualizar" 
        cancelText="Cancelar"
      >
        <Form 
          onFinish={update} 
          initialValues={{ remember: true }} 
          ref={formRef} 
          layout="vertical"
        >
          <Row>
            <Col span={24}>
              <Form.Item 
                label="Edite el Tiempo Laboral" 
                rules={[{ required: true, message: "El campo de descripción es requerido" }]}
                name="descripcion"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
}

export default UpdateJob;