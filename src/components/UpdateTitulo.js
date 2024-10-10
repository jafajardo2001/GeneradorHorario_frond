import React, { useEffect } from "react";
import { Modal, Form, Input, notification } from "antd";

const UpdateTitulo = (props) => {
  const [form] = Form.useForm();
  const url = "http://localhost:8000/api/istg/";

  // Al abrir el modal, cargamos los datos del título que se está editando
  useEffect(() => {
    if (props.open && props.formulario) {
      form.resetFields(); // Reseteamos los campos antes de cargar nuevos valores
      form.setFieldsValue({
        descripcion: props.formulario.descripcion,
      });
    }
  }, [props.open, props.formulario, form]);

  const updateTitulo = (value) => {
    fetch(`${url}update_titulo_academico/${props.formulario.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion: value.descripcion,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          notification.success({
            message: 'Éxito',
            description: data.message, // Cambiado de data.mensaje a data.message
          });
          props.getTitulos();
          form.resetFields(); // Reseteamos los campos al terminar
          props.handleCloseModal();
        } else {
          notification.error({
            message: 'Error',
            description: data.message, // Cambiado de data.mensaje a data.message
          });
        }
      })
      .catch((error) => {
        notification.error({
          message: 'Error',
          description: 'Ocurrió un error inesperado.',
        });
        console.error('Ha ocurrido un error:', error);
      });
  };
  

  return (
    <Modal
      onCancel={() => {
        form.resetFields();
        props.handleCloseModal();
      }}
      onOk={() => {
        form.submit();
      }}
      size="large"
      okText="Guardar"
      cancelText="Cancelar"
      title="Actualizar Título Académico"
      open={props.open}
    >
      <Form form={form} onFinish={updateTitulo} layout="vertical">
        <Form.Item
          label="Descripción"
          name="descripcion"
          rules={[{ required: true, message: "El campo de descripción es requerido" }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateTitulo;
