import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, TimePicker, Button, notification } from "antd";
import moment from "moment";

const { Option } = Select;

const UpdateDistribucion = ({ open, handleCloseModal, distribucion, getData }) => {
    const [form] = Form.useForm();
    const [docentes, setDocentes] = useState([]);

    useEffect(() => {
        // Cargar la lista de docentes al montar el componente
        const fetchDocentes = async () => {
            try {
                const response = await fetch("http://localhost:8000/api/istg/show_docentes"); // Asegúrate de usar la URL correcta para obtener los docentes
                const data = await response.json();

                if (response.ok && data.ok) {
                    const data_mapeada = data.data.map((value) => ({
                        value: value.id_usuario,
                        label: `${value.nombre_completo} ${value.titulo_academico}`, // Usando nombre_completo de la función showDocentes
                    }));
                    setDocentes(data_mapeada);
                } else {
                    console.error("Error en la respuesta del servidor:", data.message || "Error desconocido");
                }
            } catch (error) {
                console.error("Error al obtener los datos de los docentes:", error);
            }
        };

        fetchDocentes();
    }, []);

    useEffect(() => {
        if (distribucion) {
            // Cargar los datos de la distribución seleccionada en el formulario
            form.setFieldsValue({
                educacion_global: distribucion.educacion_global,
                carrera: distribucion.carrera,
                materia: distribucion.materia,
                docente: distribucion.docente,
                dia: distribucion.dia,
                hora_inicio: moment(distribucion.hora_inicio, "HH:mm"),
                hora_termina: moment(distribucion.hora_termina, "HH:mm"),
            });
        }
    }, [distribucion, form]);

    const onFinish = async (values) => {
        try {
            const response = await fetch(`http://localhost:8000/api/istg/horario/update_distribucion/${distribucion.id_distribucion}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...values,
                    hora_inicio: values.hora_inicio.format("HH:mm"),
                    hora_termina: values.hora_termina.format("HH:mm"),
                }),
            });

            if (!response.ok) {
                throw new Error("Error al actualizar la distribución");
            }

            const data = await response.json();
            if (data.ok) {
                notification.success({
                    message: 'Actualización exitosa',
                    description: 'Distribución actualizada correctamente.',
                });
                getData(); // Refrescar los datos
                handleCloseModal(); // Cerrar el modal
            } else {
                throw new Error(data.mensaje || "No se pudo actualizar la distribución.");
            }
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'Error al actualizar la distribución: ' + error.message,
            });
        }
    };

    return (
        <Modal
            title="Editar Distribución"
            open={open}
            onCancel={handleCloseModal}
            footer={null}
        >
            <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
            >
                <Form.Item
                    label="Educación Global"
                    name="educacion_global"
                    rules={[{ required: true, message: 'Por favor ingrese la educación global' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Carrera"
                    name="carrera"
                    rules={[{ required: true, message: 'Por favor ingrese la carrera' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Materia"
                    name="materia"
                    rules={[{ required: true, message: 'Por favor ingrese la materia' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Docente"
                    name="docente"
                    rules={[{ required: true, message: 'Por favor seleccione el docente' }]}
                >
                    <Select placeholder="Seleccione un docente">
                        {docentes.map(docente => (
                            <Option key={docente.value} value={docente.value}>
                                {docente.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Día"
                    name="dia"
                    rules={[{ required: true, message: 'Por favor seleccione el día' }]}
                >
                    <Select>
                        <Select.Option value="Lunes">Lunes</Select.Option>
                        <Select.Option value="Martes">Martes</Select.Option>
                        <Select.Option value="Miércoles">Miércoles</Select.Option>
                        <Select.Option value="Jueves">Jueves</Select.Option>
                        <Select.Option value="Viernes">Viernes</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Hora de Inicio"
                    name="hora_inicio"
                    rules={[{ required: true, message: 'Por favor seleccione la hora de inicio' }]}
                >
                    <TimePicker format="HH:mm" />
                </Form.Item>

                <Form.Item
                    label="Hora de Terminación"
                    name="hora_termina"
                    rules={[{ required: true, message: 'Por favor seleccione la hora de terminación' }]}
                >
                    <TimePicker format="HH:mm" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Actualizar Distribución
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateDistribucion;
