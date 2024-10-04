import React, { useRef } from "react";
import { Modal, Form, Input, Row, Col, Typography, notification, Title } from "antd";

const NewJornada = (props) => {
    const { Title } = Typography;
    const Formulario = useRef(null);
    const url = "http://localhost:8000/api/istg/";

    const createJornada = (value) => {
        fetch(`${url}create_jornada`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descripcion: value.descripcion }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.ok) {
                    notification.success({
                        message: "Tiempo de dedicacion Creado",
                        description: `El tiempo de dedicacion "${value.descripcion}" ha sido creado con éxito.`,
                    });
                    props.getJornada();
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
            title="Nueva Jornada"
        >
            <Form onFinish={createJornada} ref={Formulario} layout="vertical">
                <Row>
                    <Col span={24}>
                        <Form.Item
                            label="Ingrese la descripcion de la jornada"
                            rules={[
                                {
                                    required: true,
                                    message: "El campo del nombre del tiempo de dedicacion es requerido",
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

export default NewJornada;
