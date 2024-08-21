import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, Row, Col, notification } from "antd";
import Select from "react-select";

const NewUsuario = (props) => {
  const [isOpen, setIsOpen] = useState(props.isOpen);
  const [isRol, setIsRol] = useState([]);
  const [isTituloAcademico, setIsTituloAcademico] = useState([]);
  const Formulario = useRef(null);
  const url = "http://localhost:8000/api/istg/";

  useEffect(() => {
    setIsOpen(props.isOpen);
    getRol();
    getTituloAcademico();
  }, [props.isOpen]);

  function getRol() {
    fetch(`${url}show_roles`, { method: 'GET' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        let rol = data.data.map((value) => ({
          label: value.descripcion,
          value: value.id_rol
        }));
        setIsRol(rol);
      })
      .catch((error) => {
        console.error('Error fetching roles:', error);
      });
  }

  function getTituloAcademico() {
    fetch(`${url}show_data_titulo_academico`, { method: 'GET' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        let titulos = data.data.map((value) => ({
          label: value.descripcion,
          value: value.id_titulo_academico
        }));
        setIsTituloAcademico(titulos);
      })
      .catch((error) => {
        console.error('Error fetching titles:', error);
      });
  }

  function createUser(value) {
    fetch(`${url}create_usuario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedula: value.cedula,
        nombres: value.nombres,
        apellidos: value.apellidos,
        id_rol: value.perfil.value,
        id_titulo_academico: value.tituloAcademico.value
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          notification.success({
            message: 'Éxito',
            description: data.message || 'Usuario creado con éxito.',
          });
          Formulario.current.resetFields();
          props.onCloseModal();
        } else {
          notification.error({
            message: 'Error',
            description: data.message || 'Hubo un problema al crear el usuario.',
          });
        }
      })
      .catch((error) => {
        console.error('An error occurred:', error);
        notification.error({
          message: 'Error',
          description: 'Error interno en el servidor',
        });
      });
  }

  return (
    <Modal
      onCancel={() => {
        if (Formulario.current) {
          Formulario.current.resetFields();
        }
        props.onCloseModal();
      }}
      onOk={() => {
        if (Formulario && Formulario.current) {
          Formulario.current.submit();
        }
      }}
      size="large"
      okText="Guardar"
      cancelText="Cancelar"
      title="Nuevo usuario"
      open={isOpen}
    >
      <Form onFinish={createUser} ref={Formulario} layout="vertical">
        <Row>
          <Col span={24}>
            <Form.Item
              label="Ingrese la cedula"
              rules={[{ required: true, message: "El campo de cedula es requerido" }]}
              name="cedula"
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Ingrese los nombres"
              name="nombres"
              rules={[{ required: true, message: "El campo de nombres es requerido" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Ingrese los apellidos"
              name="apellidos"
              rules={[{ required: true, message: "El campo de apellidos es requerido" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Escoja el perfil" name="perfil">
              <Select options={isRol} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Escoja el título académico" name="tituloAcademico">
              <Select options={isTituloAcademico} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default NewUsuario;