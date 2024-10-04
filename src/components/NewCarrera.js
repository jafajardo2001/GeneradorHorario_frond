import React, { useRef, useEffect, useState } from "react";
import { Modal, Form, Input, Row, Col, Typography, notification, Select } from "antd";

const NewCarrera = (props) => {
    const { Title } = Typography;
    const Formulario = useRef(null);
    const url = "http://localhost:8000/api/istg/";
    const [loading, setLoading] = useState(true);
    const [isJornada, setIsJornada] = useState([]);


    function getJornada() {
        setLoading(true);
        fetch(`${url}show_jornada`, { method: 'GET' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                let jornada = data.data.map((value) => {
                    return {
                        label: value.descripcion,  // Asignar la descripción como label
                        value: value.id_jornada,   // Asignar el id_jornada como value
                    };
                });
                setIsJornada(jornada);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const createCarrera = (value) => {
        fetch(`${url}create_carrera`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre: value.nombre,
                id_jornada: value.jornada // Aseguramos que id_jornada se envíe
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.ok) {
                    notification.success({
                        message: "Carrera Creada",
                        description: `La carrera "${value.nombre}" ha sido creada con éxito.`,
                    });
                    props.getCarreras();
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

    useEffect(() => {
        getJornada();
    }, []);

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
            title="Nueva Carrera"
        >
            <Form onFinish={createCarrera} ref={Formulario} layout="vertical">
                <Row>
                    <Col span={24}>
                        <Form.Item
                            label="Ingrese el nombre de la carrera"
                            rules={[
                                {
                                    required: true,
                                    message: "El campo del nombre de carrera es requerido",
                                },
                            ]}
                            name="nombre"
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item
                            label="Escoja las jornadas"
                            name="jornada"
                            rules={[
                                {
                                    required: true,
                                    message: "Debe seleccionar una jornada",
                                },
                            ]}
                        >
                            <Select options={isJornada} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default NewCarrera;
