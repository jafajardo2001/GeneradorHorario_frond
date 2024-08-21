import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Input, Select, notification } from 'antd';

const EditUsuario = ({ open, handleCloseModal, usuarioId, getUsuarios }) => {
  const [roles, setRoles] = useState([]);
  const [form] = Form.useForm();
  const url = "http://localhost:8000/api/istg/";

  useEffect(() => {
    // Cargar roles disponibles
    fetch(`${url}show_roles`)
      .then(response => response.json())
      .then(data => {
        if (data.ok) {
          setRoles(data.roles);
        } else {
          notification.error({
            message: 'Error',
            description: 'No se pudieron cargar los roles.',
          });
        }
      })
      .catch(error => {
        notification.error({
          message: 'Error',
          description: `Ha ocurrido un error: ${error.message}`,
        });
      });

    // Cargar datos del usuario a editar
    if (usuarioId) {
      fetch(`${url}usuario/${usuarioId}`)
        .then(response => response.json())
        .then(data => {
          if (data.ok) {
            form.setFieldsValue(data.usuario);
          } else {
            notification.error({
              message: 'Error',
              description: 'No se pudieron cargar los datos del usuario.',
            });
          }
        })
        .catch(error => {
          notification.error({
            message: 'Error',
            description: `Ha ocurrido un error: ${error.message}`,
          });
        });
    }
  }, [usuarioId]);

  const updateUsuario = (values) => {
    // Generar nombre de usuario basado en las primeras letras del nombre y apellido
    const usuarioStr = values.nombres.charAt(0).toLowerCase() + values.apellidos.charAt(0).toLowerCase();
    const updatedValues = { ...values, usuario: usuarioStr };

    fetch(`${url}update_usuario/${usuarioId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedValues),
    })
      .then(response => response.json())
      .then(data => {
        if (data.ok) {
          notification.success({
            message: 'Usuario Actualizado',
            description: `El usuario ha sido actualizado con éxito.`,
          });
          getUsuarios();
          handleCloseModal();
        } else {
          notification.error({
            message: 'Error',
            description: data.message,
          });
        }
      })
      .catch(error => {
        notification.error({
          message: 'Error',
          description: `Ha ocurrido un error: ${error.message}`,
        });
      });
  };

  return (
    <Modal
      visible={open}
      onCancel={handleCloseModal}
      onOk={() => {
        form.submit();
      }}
      title="Editar Usuario"
    >
      <Form form={form} onFinish={updateUsuario}>
        <Form.Item
          name="cedula"
          label="Cédula"
          rules={[{ required: true, message: 'La cédula es requerida' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="nombres"
          label="Nombres"
          rules={[{ required: true, message: 'El nombre es requerido' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="apellidos"
          label="Apellidos"
          rules={[{ required: true, message: 'Los apellidos son requeridos' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="perfil"
          label="Perfil"
          rules={[{ required: true, message: 'El perfil es requerido' }]}
        >
          <Select options={roles}/>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUsuario;
