import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, Row, Col, notification } from "antd";
import Select from "react-select";

const UpdateUsuario = (props) => {
    const [isOpen, setIsOpen] = useState(props.isOpen);
    const [isRol, setIsRol] = useState([]);
    const [isTituloAcademico, setIsTituloAcademico] = useState([]);
    const [isJob, setIsJob] = useState([]);
    const [isCarreras, setIsCarreras] = useState([]);

    // Estado para almacenar múltiples carreras seleccionadas
    const [selectedCarreras, setSelectedCarreras] = useState([]);
    const [initialValues, setInitialValues] = useState(null);

    const Formulario = useRef(null);
    const url = "http://localhost:8000/api/istg/";

    useEffect(() => {
        setIsOpen(props.isOpen);
        getRol();
        getTituloAcademico();
        getJobs();
        getCarreras();
        if (props.userId) {
            loadUserData(props.id); // Cargar los datos del usuario para editar
        }
    }, [props.isOpen, props.id]);

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

    function loadUserData(userId) {
        fetch(`${url}show_usuario/${userId}`, { method: 'GET' })
            .then((response) => response.json())
            .then((data) => {
                if (data && data.data) { // Asegúrate de que data y data.data existan
                    const user = data.data;
                    setInitialValues({
                        cedula: user.cedula,
                        nombres: user.nombres,
                        apellidos: user.apellidos,
                        correo: user.correo,
                        telefono: user.telefono,
                        perfil: isRol.find(rol => rol.value === user.id_rol),
                        job: isJob.find(job => job.value === user.id_job),
                        tituloAcademico: isTituloAcademico.find(titulo => titulo.value === user.id_titulo_academico),
                    });
                    // Mapeamos las carreras seleccionadas para que sean compatibles con el componente Select
                    setSelectedCarreras(user.carreras?.map(carrera => ({
                        label: carrera.nombre,
                        value: carrera.id_carrera
                    })) || []); // Manejo de casos donde user.carreras podría ser undefined
                    // Actualiza los valores del formulario
                    if (Formulario.current) {
                        Formulario.current.setFieldsValue({
                            cedula: user.cedula,
                            nombres: user.nombres,
                            apellidos: user.apellidos,
                            correo: user.correo,
                            telefono: user.telefono,
                            perfil: isRol.find(rol => rol.value === user.id_rol),
                            job: isJob.find(job => job.value === user.id_job),
                            tituloAcademico: isTituloAcademico.find(titulo => titulo.value === user.id_titulo_academico),
                            carreras: user.carreras?.map(carrera => ({
                                label: carrera.nombre,
                                value: carrera.id_carrera
                            })) || [],
                        });
                    }
                } else {
                    console.error('No user data found');
                }
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });
    }

    // Manejar cambios en las carreras seleccionadas
    function handleCarreraChange(selectedOptions) {
        setSelectedCarreras(selectedOptions || []);
    }

    // Actualizar el usuario
    function updateUser(value) {
        fetch(`${url}update_usuario/${props.userId}`, {
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
                id_carreras: selectedCarreras.map(carrera => carrera.value), // Enviar las carreras seleccionadas
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
                    props.getUser(); // Refrescar la lista de usuarios
                    setSelectedCarreras([]); // Resetear carreras seleccionadas
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
            okText="Guardar"
            cancelText="Cancelar"
            title="Editar usuario"
            open={isOpen}
        >
            <Form
                onFinish={updateUser}
                ref={Formulario}
                layout="vertical"
                initialValues={initialValues}  // Valores iniciales del formulario
            >
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
                                isMulti
                                value={selectedCarreras}
                                onChange={handleCarreraChange}
                            />
                        </Form.Item>
                    </Col>

                </Row>
            </Form>
        </Modal>
    );
};

export default UpdateUsuario;
