import React, { useState, useEffect, useRef } from 'react';
import { Modal, Form, Col, Row, Input, notification, Select } from 'antd';

const UpdateUsuario = ({ open, handleCloseModal, formulario, getUsuarios }) => {
  const formRef = useRef(null);
  const [id, setId] = useState(0);
  const [roles, setRoles] = useState([]);
  const url = "http://localhost:8000/api/istg/"; // Cambia esta URL a tu endpoint

  useEffect(() => {
    // Cargar roles disponibles
    fetch(`${url}roles`)
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

    if (formRef.current) {
      setId(formulario.id);
      formRef.current.setFieldsValue({
        cedula: formulario.cedula,
        nombres: formulario.nombres,
        apellidos: formulario.apellidos,
        perfil: formulario.perfil,
      });
    }
  }, [formulario]);

  const update = (values) => {
    fetch(`${url}update_usuario/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la respuesta del servidor');
        }
        return response.json();
      })
      .then(data => {
        if (data.ok) {
          notification.success({
            message: 'Usuario Actualizado',
            description: `El usuario "${values.nombres} ${values.apellidos}" ha sido actualizado con éxito.`,
          });
          getUsuarios(); // Asegúrate de que esta función esté definida y actualice la lista de usuarios
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
      onCancel={handleCloseModal}
      onOk={() => {
        if (formRef.current) {
          formRef.current.submit();
        }
      }}
      open={open}
      title="Actualizar Usuario"
      okText="Actualizar"
      cancelText="Cancelar"
    >
      <Form
        onFinish={update}
        ref={formRef}
        layout="vertical"
      >
        <Row>
          <Col span={24}>
            <Form.Item
              label="Cédula"
              rules={[{ required: true, message: 'La cédula es requerida' }]}
              name="cedula"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Nombres"
              rules={[{ required: true, message: 'El nombre es requerido' }]}
              name="nombres"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Apellidos"
              rules={[{ required: true, message: 'Los apellidos son requeridos' }]}
              name="apellidos"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Perfil"
              rules={[{ required: true, message: 'El perfil es requerido' }]}
              name="perfil"
            >
              <Select placeholder="Selecciona un perfil">
                {roles.map(role => (
                  <Select.Option key={role.id_rol} value={role.id_rol}>
                    {role.descripcion}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default UpdateUsuario;
