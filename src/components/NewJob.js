import React, { useRef } from "react";
import { Modal, Form, Input, Row, Col, Typography, notification } from "antd";

const NewPerfil = (props) => {
  const { Title } = Typography;
  const Formulario = useRef(null);
  const url = "http://localhost:8000/api/istg/";

  const createJob = (value) => {
    fetch(`${url}create_job`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion: value.descripcion }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          notification.success({
            message: "Tiempo Laboral Creado",
            description: `El tiempo Laboral "${value.descripcion}" ha sido creado con éxito.`,
          });
          props.getJobs();
        } else {
          notification.error({
            message: "Error",
            description: data.message,
          });
        }
        Formulario.current.resetFields();
        props.handleCloseModal();
      })
      .catch((error) => {
        notification.error({
          message: "Error",
          description: `Ha ocurrido un error: ${error.message}`,
        });
      });
  };

  return (
    <Modal
      onCancel={props.handleCloseModal}
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
      <Form onFinish={createJob} ref={Formulario} layout="vertical">
        <Row>
          <Col span={24}>
            <Form.Item
              label="Ingrese el nombre del perfil"
              rules={[
                {
                  required: true,
                  message: "El campo del nombre del tiempo de dedicacion es requerido",
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

export default NewPerfil;
