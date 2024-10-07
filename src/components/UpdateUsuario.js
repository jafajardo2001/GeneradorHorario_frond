import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, Row, Col, notification, Button } from "antd";
import Select from "react-select";

const UpdateUsuario = (props) => {
  const [isOpen, setIsOpen] = useState(props.isOpen);
  const [isRol, setIsRol] = useState([]);
  const [isTituloAcademico, setIsTituloAcademico] = useState([]);
  const [isJob, setIsJob] = useState([]);
  const [isCarreras, setIsCarreras] = useState([]);
  const [showCarreras, setShowCarreras] = useState(false); // Estado para controlar la visibilidad de carreras
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [selectedCarreras, setSelectedCarreras] = useState([]);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [selectedCareerToDelete, setSelectedCareerToDelete] = useState(null);

  const Formulario = useRef(null);
  const url = "http://localhost:8000/api/istg/";

  useEffect(() => {
    setIsOpen(props.isOpen);
    if (props.userId) {
      getUsuarioData(props.userId);
    }
    getRol();
    getTituloAcademico();
    getJobs();
    getCarreras();
  }, [props.isOpen, props.userId]);

  function getUsuarioData(userId) {
    fetch(`${url}usuarios/${userId}`, { method: 'GET' })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          const usuario = data.data;
          setSelectedUserData(usuario);

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

          // Establecer showCarreras basado en el perfil actual
          setShowCarreras(usuario.rol_descripcion === 'Docente');

          setSelectedCarreras(usuario.carreras.map((carrera) => ({
            label: `${carrera.nombre} - ${carrera.jornada ? carrera.jornada.descripcion : 'Sin jornada'}`,
            value: carrera.id_carrera,
            id_jornada: carrera.jornada ? carrera.jornada.id_jornada : null,
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
          label: `${value.nombre} (${value.descripcion_jornada})`,
          value: value.id_carrera,
          id_jornada: value.id_jornada,
        }));
        setIsCarreras(carreras);
      })
      .catch((error) => {
        console.error('Error fetching careers:', error);
      });
  }

  function handlePerfilChange(selectedPerfil) {
    Formulario.current.setFieldsValue({ perfil: selectedPerfil });
    setShowCarreras(selectedPerfil.label === 'Docente');
  }

  function handleCarreraChange(selectedOptions) {
    if (selectedCarreras.length > (selectedOptions ? selectedOptions.length : 0)) {
      const removedCareer = selectedCarreras.find(c => !selectedOptions.includes(c));
      if (removedCareer) {
        setSelectedCareerToDelete(removedCareer);
        setConfirmDeleteModal(true);
        return;
      }
    }
    setSelectedCarreras(selectedOptions || []);
  }

  function updateUser(value) {
    const carrerasJornadas = showCarreras
      ? selectedCarreras.map(carrera => ({
        id_carrera: carrera.value,
        id_jornada: carrera.id_jornada,
      }))
      : [];

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
        carreras_jornadas: carrerasJornadas,
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

  function handleDeleteCareer() {
    if (!selectedCareerToDelete) return;

    const updatedCarreras = selectedCarreras.filter(c => c.value !== selectedCareerToDelete.value);
    setSelectedCarreras(updatedCarreras);

    fetch(`${url}eliminarCarrera/${props.userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_carrera: selectedCareerToDelete.value }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.ok) {
          notification.success({
            message: 'Carrera eliminada',
            description: 'La carrera se ha eliminado correctamente.',
          });
        } else {
          notification.error({
            message: 'Error',
            description: data.message || 'Hubo un problema al eliminar la carrera.',
          });
          setSelectedCarreras(prev => [...prev, selectedCareerToDelete]);
        }
      })
      .catch(error => {
        console.error('Error eliminando carrera:', error);
        notification.error({
          message: 'Error',
          description: 'Error en el servidor al eliminar la carrera.',
        });
        setSelectedCarreras(prev => [...prev, selectedCareerToDelete]);
      });

    setConfirmDeleteModal(false);
    setSelectedCareerToDelete(null);
  }

  return (
    <>
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
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Ingrese la cédula"
                rules={[{ required: true, message: "El campo de cédula es requerido" }]}
                name="cedula"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Ingrese los nombres"
                rules={[{ required: true, message: "El campo de nombres es requerido" }]}
                name="nombres"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Ingrese los apellidos"
                rules={[{ required: true, message: "El campo de apellidos es requerido" }]}
                name="apellidos"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Ingrese el correo"
                rules={[{ required: true, message: "El campo de correo es requerido" }]}
                name="correo"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Ingrese el teléfono"
                rules={[{ required: true, message: "El campo de teléfono es requerido" }]}
                name="telefono"
              >
                <Input />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Escoja el perfil" name="perfil">
                <Select options={isRol} onChange={handlePerfilChange} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Escoja el trabajo" name="job">
                <Select options={isJob} />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Escoja el título académico" name="tituloAcademico">
                <Select options={isTituloAcademico} />
              </Form.Item>
            </Col>

            {showCarreras && (
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
            )}
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Confirmar eliminación"
        visible={confirmDeleteModal}
        onOk={handleDeleteCareer}
        onCancel={() => setConfirmDeleteModal(false)}
      >
        <p>¿Está seguro de que desea eliminar la carrera {selectedCareerToDelete?.label}?</p>
      </Modal>
    </>
  );
};

export default UpdateUsuario;
