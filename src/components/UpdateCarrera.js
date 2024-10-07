import React, { useRef, useEffect, useState } from "react";
import { Modal, Form, Input, Row, Col, Typography, notification, Select } from "antd";

const UpdateCarrera = (props) => {
    const formRef = useRef(null);
    const url = "http://localhost:8000/api/istg/";
    const [id, setId] = useState(0);
    const [isJornada, setIsJornada] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (formRef.current) {
            setId(props.formulario.id);
            formRef.current.setFieldsValue({
                nombre: props.formulario.nombre,
                id_jornada: props.formulario.jornada,
            });
        }
    }, [props.formulario]);

    const update = (value) => {
        fetch(`${url}update_carrera/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(value),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.ok) {
                    notification.success({
                        message: "Carrera Actualizada",
                        nombre: `El perfil "${value.nombre}" ha sido actualizado con éxito.`,
                    });
                    props.getCarreras();
                    props.handleCloseModal();
                } else {
                    notification.error({
                        message: "Error",
                        description: data.message,
                    });
                }
            })
            .catch((error) => {
                notification.error({
                    message: "Error",
                    description: `Ha ocurrido un error: ${error.message}`,
                });
            });
    };
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
    useEffect(() => {
        getJornada();
    }, []);
    return (
        <>
            <Modal
                onCancel={() => {
                    props.handleCloseModal();
                }}
                onOk={() => {
                    if (formRef && formRef.current) {
                        formRef.current.submit();
                    }
                }}
                open={props.open}
                title="Actualizar la carrera"
                okText="Actualizar"
                cancelText="Cancelar"
            >
                <Form onFinish={update} ref={formRef} layout="vertical">
                    <Row>
                        <Col span={24}>
                            <Form.Item
                                label="Edite el nombre de la carrera"
                                rules={[{ required: true, message: "El campo del nombre del perfil es requerido" }]}
                                name="nombre"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Col span={24}>
                        <Form.Item
                            label="Escoja las jornadas"
                            name="id_jornada"
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
                </Form>
            </Modal>
        </>
    );
};

export default UpdateCarrera;
