import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, Row, Col, notification, Button } from "antd";
import Select from "react-select";

const NewUsuario = (props) => {
  const [isOpen, setIsOpen] = useState(props.isOpen);
  const [isRol, setIsRol] = useState([]);
  const [isTituloAcademico, setIsTituloAcademico] = useState([]);
  const [isJob, setIsJob] = useState([]);
  const [isCarreras, setIsCarreras] = useState([]);

  // Estado para almacenar múltiples carreras seleccionadas
  const [selectedCarreras, setSelectedCarreras] = useState([]);

  const Formulario = useRef(null);
  const url = "http://localhost:8000/api/istg/";

  useEffect(() => {
    setIsOpen(props.isOpen);
    getRol();
    getTituloAcademico();
    getJobs();
    getCarreras();
  }, [props.isOpen]);

  function getRol() {
    fetch(`${url}show_roles`, { method: 'GET' })
      .then((response) => response.json())
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

  function getJobs() {
    fetch(`${url}show_jobs/`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        let horas = data.data.map((value) => ({
          label: value.descripcion,
          value: value.id_job
        }));
        setIsJob(horas);
      })
      .catch((error) => {
        console.error('Error fetching jobs:', error);
      });
  }

  function getTituloAcademico() {
    fetch(`${url}show_data_titulo_academico`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        let titulos = data.data.map((value) => ({
          label: value.descripcion,
          value: value.id_titulo_academico
        }));
        setIsTituloAcademico(titulos);
      })
      .catch((error) => {
        console.error('Error fetching academic titles:', error);
      });
  }

  function getCarreras() {
    fetch(`${url}show_carrera`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        let carreras = data.data.map((value) => ({
          label: value.nombre,
          value: value.id_carrera
        }));
        setIsCarreras(carreras);
      })
      .catch((error) => {
        console.error('Error fetching careers:', error);
      });
  }

  // Función para manejar la selección y eliminación de carreras
  function handleCarreraChange(selectedOptions) {
    setSelectedCarreras(selectedOptions || []);  // Actualiza el estado con las carreras seleccionadas
  }

  function createUser(value) {
    fetch(`${url}create_usuario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cedula: value.cedula,
        nombres: value.nombres,
        apellidos: value.apellidos,
        correo: value.correo,
        telefono: value.telefono,
        id_rol: value.perfil.value,
        id_titulo_academico: value.tituloAcademico.value,
        id_job: value.job.value,
        id_carreras: selectedCarreras.map(carrera => carrera.value)  // Enviamos todas las carreras seleccionadas
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
          props.getUser();  // Refrescar la lista de usuarios
          setSelectedCarreras([]);  // Resetear carreras seleccionadas
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
              label="Ingrese la cédula"
              rules={[{ required: true, message: "El campo de cédula es requerido" }]}
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
            <Form.Item
              label="Ingrese el correo"
              name="correo"
              rules={[{ required: true, message: "El campo de correo es requerido" }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Ingrese un número de teléfono"
              name="telefono"
              rules={[{ required: true, message: "El campo de teléfono es requerido" }]}
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
            <Form.Item label="Escoja las horas" name="job">
              <Select options={isJob} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Escoja el título académico" name="tituloAcademico">
              <Select options={isTituloAcademico} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Escoja las carreras" name="carreras">
              <Select
                options={isCarreras}
                isMulti  // Permite la selección múltiple
                value={selectedCarreras}
                onChange={handleCarreraChange}  // Maneja cambios en las selecciones
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default NewUsuario;
