import React, { useRef, useEffect, useState } from "react";
import { Modal, Form, Input, Row, Col, notification, App } from "antd";
const UpdateParalelo = (props) => {
    const formRef = useRef(null);
    const [id, setId] = useState(0);
    const url = "http://localhost:8000/api/istg/";
    const update = (value) => {
        console.log("Datos enviados:", value);
        fetch(`${url}update_paralelo/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(value),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Datos del servidor:", data); // Imprime los datos recibidos
                if (data.ok) {
                    notification.success({
                        message: 'Actualización Exitosa',
                        description: data.message || 'Paralelo actualizado correctamente.',
                        placement: 'topRight',
                    });
                    formRef.current.resetFields();
                    props.handleCloseModal();
                    props.getParalelos();
                } else {
                    notification.error({
                        message: 'Error',
                        description: data.message || 'No se pudo actualizar el paralelo.',
                        placement: 'topRight',
                    });
                }
            })
            .catch((error) => {
                notification.error({
                    message: 'Error',
                    description: 'Ocurrió un error al actualizar el paralelo: ' + error.message,
                    placement: 'topRight',
                });
            });
    };
    useEffect(() => {
        if (formRef.current) {
            setId(props.formulario.id); // Asigna el ID del paralelo seleccionado
            formRef.current.setFieldsValue(props.formulario); // Asigna los valores del paralelo seleccionado
        }
    }, [props.formulario]);
    return (
        <App>
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
                title="Actualizar Paralelo"
                okText="Actualizar"
                cancelText="Cancelar"
            >
                <Form
                    onFinish={update}
                    initialValues={{ paralelo: props.selectedParalelo?.paralelo }}
                    ref={formRef}
                    layout="vertical"
                >
                    <Row>
                        <Col span={24}>
                            <Form.Item
                                label="Ingrese el nuevo paralelo"
                                name="paralelo"
                                rules={[
                                    {
                                        required: true,
                                        message: "El campo de paralelo es requerido",
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </App>
    );
};
export default UpdateParalelo;