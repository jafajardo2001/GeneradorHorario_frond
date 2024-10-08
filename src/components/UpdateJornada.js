import React, { useRef, useEffect, useState } from "react";
import { Modal, Form, Input, Row, Col, notification } from "antd";
const UpdateJornada = (props) => {
    const formRef = useRef(null);
    const [id, setId] = useState(0);
    const url = "http://localhost:8000/api/istg/";
    const updateJornada = (value) => {
        fetch(`${url}update_jornada/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.ok) {
                    notification.success({
                        message: 'Actualización Exitosa',
                        description: data.message || 'Jornada actualizada correctamente.',
                        placement: 'topRight',
                    });
                    formRef.current.resetFields();
                    props.handleCloseModal();
                    props.getJornada(); // Asumiendo que tienes una función para actualizar la lista de jornadas
                } else {
                    notification.error({
                        message: 'Error',
                        description: data.message || 'No se pudo actualizar la jornada.',
                        placement: 'topRight',
                    });
                }
            })
            .catch((error) => {
                notification.error({
                    message: 'Error',
                    description: 'Ocurrió un error al actualizar la jornada: ' + error.message,
                    placement: 'topRight',
                });
            });
    };
    useEffect(() => {
        if (formRef.current) {
            setId(props.formulario.id); // Asigna el ID de la jornada seleccionada
            formRef.current.setFieldsValue(props.formulario); // Asigna los valores de la jornada seleccionada
        }
    }, [props.formulario]);
    return (
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
            title="Actualizar Jornada"
            okText="Actualizar"
            cancelText="Cancelar"
        >
            <Form
                onFinish={updateJornada}
                initialValues={{ remember: true }}
                ref={formRef}
                layout="vertical"
            >
                <Row>
                    <Col span={24}>
                        <Form.Item
                            label="Edite la descripción de la jornada"
                            rules={[
                                {
                                    required: true,
                                    message: "El campo de descripción de jornada es requerido",
                                },
                            ]}
                            name="descripcion"
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default UpdateJornada;