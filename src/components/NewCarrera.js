import React, { useRef } from "react";
import { Modal, Form, Input, Row, Col, Typography, notification } from "antd";

const NewCarrera = (props) => {
    const { Title } = Typography;
    const Formulario = useRef(null);
    const url = "http://localhost:8000/api/istg/";

    const createCarrera = (value) => {
        fetch(`${url}create_carrera`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre: value.nombre }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.ok) {
                    notification.success({
                        message: "Carrera Creada",
                        nombre: `La carrera "${value.nombre}" ha sido creado con éxito.`,
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
                </Row>
            </Form>
        </Modal>
    );
};

export default NewCarrera;
