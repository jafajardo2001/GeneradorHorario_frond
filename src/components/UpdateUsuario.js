import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, Row, Col, notification, Button } from "antd";
import Select from "react-select";

const UpdateUsuario = (props) => {
  const [isOpen, setIsOpen] = useState(props.isOpen);
  const [isRol, setIsRol] = useState([]);
  const [isTituloAcademico, setIsTituloAcademico] = useState([]);
  const [isJob, setIsJob] = useState([]);
  const [isCarreras, setIsCarreras] = useState([]);

  // Estado para almacenar los datos del usuario
  const [selectedUserData, setSelectedUserData] = useState(null);

  // Estado para almacenar múltiples carreras seleccionadas
  const [selectedCarreras, setSelectedCarreras] = useState([]);

  const Formulario = useRef(null);
  const url = "http://localhost:8000/api/istg/";

  useEffect(() => {
    setIsOpen(props.isOpen);
    if (props.userId) {
      getUsuarioData(props.userId); // Cargar los datos del usuario
    }
    getRol();
    getTituloAcademico();
    getJobs();
    getCarreras();
  }, [props.isOpen, props.userId]);

  // Cargar datos del usuario desde el servidor
  function getUsuarioData(userId) {
    fetch(`${url}usuarios/${userId}`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          const usuario = data.data;
          setSelectedUserData(usuario);
  
          // Establecer valores iniciales en el formulario
          Formulario.current.setFieldsValue({
            cedula: usuario.cedula,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            correo: usuario.correo,
            telefono: usuario.telefono,
            perfil: { label: usuario.rol_descripcion, value: usuario.id_rol },
            job: { label: usuario.job_descripcion, value: usuario.id_job },
            tituloAcademico: { label: usuario.titulo_academico_descripcion, value: usuario.id_titulo_academico },
          });
  
          // Convertir las carreras del usuario a un formato compatible con el select
          setSelectedCarreras(usuario.carreras.map((carrera) => ({
            label: `${carrera.nombre} - ${carrera.jornada ? carrera.jornada.descripcion : 'Sin jornada'}`,  // Mostrar carrera y jornada
            value: carrera.id_carrera,
            jornada: carrera.jornada ? carrera.jornada.id_jornada : null,  // Guardar id_jornada si lo necesitas para otro proceso
          })));
        } else {
          notification.error({
            message: 'Error',
            description: 'Error al cargar los datos del usuario.',
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        notification.error({
          message: 'Error',
          description: 'Error en el servidor al obtener los datos del usuario.',
        });
      });
  }
  
  
  





  // Funciones para cargar los datos de los selects
  function getRol() {
    fetch(`${url}show_roles`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        let rol = data.data.map((value) => ({
          label: value.descripcion,
          value: value.id_rol,
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
          value: value.id_job,
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
          value: value.id_titulo_academico,
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
          label: value.nombre + " (" + value.descripcion_jornada + ")",
          value: value.id_carrera, // id de la carrera
          id_jornada: value.id_jornada
        }));
        setIsCarreras(carreras);
      })
      .catch((error) => {
        console.error('Error fetching careers:', error);
      });
  }

  // Función para manejar la selección de carreras
  function handleCarreraChange(selectedOptions) {
    setSelectedCarreras(selectedOptions || []); // Actualiza las carreras seleccionadas
  }

  // Función para actualizar el usuario
  function updateUser(value) {
    console.log({
        cedula: value.cedula,
        nombres: value.nombres,
        apellidos: value.apellidos,
        correo: value.correo,
        telefono: value.telefono,
        id_rol: value.perfil.value,
        id_titulo_academico: value.tituloAcademico.value,
        id_job: value.job.value,
        id_carreras: selectedCarreras.map((carrera) => carrera.value),
    });

    fetch(`${url}updateUsuario/${props.userId}`, {
        method: 'PUT',
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
            carreras_jornadas: selectedCarreras.map(carrera => ({
              id_carrera: carrera.value,   // id de la carrera
              id_jornada: carrera.id_jornada // id de la jornada correspondiente
          })),
        }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.ok) {
            notification.success({
                message: 'Éxito',
                description: data.message || 'Usuario actualizado con éxito.',
            });
            Formulario.current.resetFields();
            props.onCloseModal();
            props.getUser();
            setSelectedCarreras([]);
        } else {
            notification.error({
                message: 'Error',
                description: data.message || 'Hubo un problema al actualizar el usuario.',
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
      okText="Actualizar"
      cancelText="Cancelar"
      title="Actualizar usuario"
      open={isOpen}
    >
      <Form onFinish={updateUser} ref={Formulario} layout="vertical">
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
            <Form.Item label="Escoja la carrera">
              <Select
                value={selectedCarreras}
                onChange={handleCarreraChange}
                options={isCarreras}
                isMulti
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default UpdateUsuario;
