import React, { useRef, useEffect, useState } from "react";
import { Modal, Form, Col, Row, Input, notification } from "antd";

const UpdateCarrera = (props) => {
    const formRef = useRef(null);
    const url = "http://localhost:8000/api/istg/";
    const [id, setId] = useState(0);

    useEffect(() => {
        if (formRef.current) {
            setId(props.formulario.id);
            formRef.current.setFieldsValue({
                nombre: props.formulario.nombre,
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
                </Form>
            </Modal>
        </>
    );
};

export default UpdateCarrera;
