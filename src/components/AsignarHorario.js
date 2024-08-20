import { Form, Input, Modal, Select, Spin, notification, Button } from "antd";
import React, { useEffect, useState } from "react";

const AsignarHorario = (props) => {
    const [loading, setLoading] = useState(true);
    const [usuarios, setUsuarios] = useState([]);
    const [isOpen, setIsOpen] = useState(props.isOpen);
    const [mensajeLoading, setMensajeLoading] = useState("Cargando...");
    const [form] = Form.useForm();

    useEffect(() => {
        setIsOpen(props.isOpen);
    }, [props.isOpen]);

    useEffect(() => {
        const fetchUsuarios = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/istg/show_usuario');
                const data = await response.json();
                if (data.ok) {
                    setUsuarios(data.data.map(user => ({
                        value: user.id_usuario,
                        label: `${user.nombres} ${user.apellidos}`
                    })));
                } else {
                    notification.error({
                        message: 'Error',
                        description: data.message || 'Error al obtener usuarios.'
                    });
                }
            } catch (error) {
                notification.error({
                    message: 'Error',
                    description: error.message
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUsuarios();
    }, []);

    const dias = [
        { value: "Lunes", label: "Lunes" },
        { value: "Martes", label: "Martes" },
        { value: "Miércoles", label: "Miércoles" },
        { value: "Jueves", label: "Jueves" },
        { value: "Viernes", label: "Viernes" }
    ];

    const handleFinish = async (values) => {
        setLoading(true);
        const data = {
            data: [{
                id_usuario: values.usuario,
                dia: values.dia,
                hora_inicio: values.hora_inicio,
                hora_termina: values.hora_termina
            }]
        };

        try {
            const response = await fetch('http://localhost:8000/api/istg/create_horario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();

            if (result.ok) {
                notification.success({
                    message: 'Éxito',
                    description: result.mensaje || 'Horario creado con éxito.'
                });
                props.closeHandleModal();
            } else {
                notification.error({
                    message: 'Error',
                    description: result.mensaje_error || 'Error al crear horario.'
                });
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            title={"Asignación de horario"}
            okText="Asignar"
            onCancel={() => props.closeHandleModal()}
            footer={[
                <Button key="cancel" onClick={() => props.closeHandleModal()}>
                    Cancelar
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={() => form.submit()}
                    loading={loading}
                >
                    Asignar
                </Button>
            ]}
        >
            {loading ? (
                <Spin tip={mensajeLoading} />
            ) : (
                <Form
                    form={form}
                    onFinish={handleFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="Escoja el usuario"
                        name="usuario"
                        rules={[{ required: true, message: 'Por favor, seleccione un usuario.' }]}
                    >
                        <Select options={usuarios} />
                    </Form.Item>

                    <Form.Item
                        label="Escoja el día"
                        name="dia"
                        rules={[{ required: true, message: 'Por favor, seleccione un día.' }]}
                    >
                        <Select options={dias} />
                    </Form.Item>

                    <Form.Item
                        label="Hora que inicia"
                        name="hora_inicio"
                        rules={[{ required: true, message: 'Por favor, ingrese la hora de inicio.' }]}
                    >
                        <Input type="time" />
                    </Form.Item>

                    <Form.Item
                        label="Hora que termina"
                        name="hora_termina"
                        rules={[{ required: true, message: 'Por favor, ingrese la hora de finalización.' }]}
                    >
                        <Input type="time" />
                    </Form.Item>
                </Form>
            )}
        </Modal>
    );
};

export default AsignarHorario;
