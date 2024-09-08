import React, { useRef, useEffect, useState } from "react";
import { Modal, Form, Col, Row, Input, notification } from "antd";
import { SyncOutlined, PlusCircleOutlined, ClearOutlined, SearchOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons";

const UpdateCurso = (props) => {
  const formRef = useRef(null);
  const [id, setId] = useState(0);
  const url = "http://localhost:8000/api/istg/";

  const update = (value) => {
    fetch(`${url}update_nivel/${id}`, {
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
            description: data.message || 'Curso actualizado correctamente.',
            placement: 'topRight',
          });
          formRef.current.resetFields();
          props.handleCloseModal();
          props.getCurso();
        } else {
          notification.error({
            message: 'Error',
            description: data.message || 'No se pudo actualizar el curso.',
            placement: 'topRight',
          });
        }
      })
      .catch((error) => {
        notification.error({
          message: 'Error',
          description: 'Ocurrió un error al actualizar el curso: ' + error.message,
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
        title="Actualizar el curso" 
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
                label="Edite el numero" 
                rules={[{ required: true, message: "El campo del numero es requerido" }]}
                name="numero"
              >
                <Input />
              </Form.Item>

              <Form.Item 
                label="Edite el nemonico del curso" 
                rules={[{ required: true, message: "El campo del nemonico es requerido" }]}
                name="nemonico"
              >
                <Input />
              </Form.Item>

              <Form.Item 
                label="Edite el termino del curso" 
                rules={[{ required: true, message: "El campo del termino es requerido" }]}
                name="termino"
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

export default UpdateCurso;
