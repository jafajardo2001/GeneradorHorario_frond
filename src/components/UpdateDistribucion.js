import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, TimePicker, Button, notification, Spin } from "antd";
import moment from "moment";

const { Option } = Select;

const UpdateDistribucion = (props) => {
    const [loading, setLoading] = useState(true);
    const [cursos, setCursos] = useState([]); // Estado para cursos
    const [docentes, setDocentes] = useState([]); // Lista de docentes
    const [materias, setMaterias] = useState([]); // Lista de materias
    const [carrera, setCarrera] = useState([]); // Lista de carreras
    const [cursoSelect, setCursoSelect] = useState(null); // Curso seleccionado
    const [carreraSelect, setCarreraSelect] = useState(null); // Carrera seleccionada
    const [mensajeLoading, setMensajeLoading] = useState("Cargando...");
    const [isDocenteSelectEnabled, setIsDocenteSelectEnabled] = useState(false); // Habilitar selección de docentes
    const [form] = Form.useForm(); // Crear instancia de Form
    const url = "http://localhost:8000/api/istg/";

   // Función para cargar datos con spinner
   const loadDataWithSpinner = async (fetchFunction, successCallback) => {
    try {
        setLoading(true); // Activar spinner
        await fetchFunction(); // Ejecutar la función de fetch
        successCallback(); // Llamar al callback cuando el fetch se complete
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    } finally {
        setLoading(false); // Desactivar spinner
    }
};

// Cargar materias al montar el componente
const fetchMaterias = async () => {
    try {
        const response = await fetch(`${url}show_data_asignatura`);
        const data = await response.json();

        if (response.ok && data.ok) {
            const data_mapeada = data.data.map((value) => ({
                value: value.id_materia,
                label: value.descripcion,
            }));
            setMaterias(data_mapeada);
        } else {
            throw new Error(data.message || "Error desconocido");
        }
    } catch (error) {
        notification.error({
            message: 'Error al cargar materias',
            description: error.message,
        });
    }
};

// Cargar cursos al montar el componente
const fetchCursos = async () => {
    try {
        const response = await fetch(`${url}show_nivel`);
        const data = await response.json();

        if (response.ok && data.ok) {
            const data_mapeada = data.data.map((value) => ({
                value: value.id_nivel,
                label: `${value.nemonico} ${value.termino}`,
            }));
            setCursos(data_mapeada);
        } else {
            throw new Error(data.message || "Error desconocido");
        }
    } catch (error) {
        notification.error({
            message: 'Error al cargar cursos',
            description: error.message,
        });
    }
};

// Cargar carreras al montar el componente
const fetchCarreras = async () => {
    try {
        const response = await fetch(`${url}show_carrera`);
        const data = await response.json();

        if (response.ok && data.ok) {
            const data_mapeada = data.data.map((value) => ({
                value: value.id_carrera,
                label: `${value.nombre} (${value.descripcion_jornada})`,
            }));
            setCarrera(data_mapeada);
        } else {
            throw new Error(data.message || "Error desconocido");
        }
    } catch (error) {
        notification.error({
            message: 'Error al cargar carreras',
            description: error.message,
        });
    }
};

// Cargar docentes correspondientes a la carrera seleccionada
const filterDocentes = async (idCarrera) => {
    try {
        const response = await fetch(`${url}obtener_docentes_por_carrera/${idCarrera}`);
        const data = await response.json();

        if (response.ok && data.ok) {
            const filteredDocentes = data.data.map((value) => ({
                value: value.id_usuario,
                label: `${value.nombre_completo} ${value.titulo_academico}`,
            }));
            setDocentes(filteredDocentes);
            setIsDocenteSelectEnabled(true); // Habilitar el select de docentes
        } else {
            throw new Error(data.message || "Error desconocido");
        }
    } catch (error) {
        notification.error({
            message: 'Error al cargar docentes',
            description: error.message,
        });
    }
};

// Filtrar materias por curso
const fetchMateriasPorCurso = async (idCurso) => {
    try {
        const response = await fetch(`${url}obtener_materias_por_nivel/${idCurso}`);
        const data = await response.json();

        if (response.ok && data.ok) {
            const filteredMaterias = data.data.map((value) => ({
                value: value.id_materia,
                label: value.descripcion,
            }));
            setMaterias(filteredMaterias);
        } else {
            throw new Error(data.message || "Error desconocido");
        }
    } catch (error) {
        notification.error({
            message: 'Error al cargar materias por curso',
            description: error.message,
        });
    }
};

// Cargar datos cuando se edita la distribución
useEffect(() => {
    loadDataWithSpinner(async () => {
        await fetchMaterias();
        await fetchCursos();
        await fetchCarreras();
    }, () => {
        if (props.distribucion) {
            form.setFieldsValue({
                educacion_global: props.distribucion.educacion_global,
                carrera: props.distribucion.id_carrera, // Se asigna el ID de la carrera
                materia: props.distribucion.id_materia, // Se asigna el ID de la materia
                docente: props.distribucion.id_docente, // Se asigna el ID del docente
                nivel: props.distribucion.id_nivel, // Se asigna el ID del curso
                dia: props.distribucion.dia,
                hora_inicio: moment(props.distribucion.hora_inicio, "HH:mm"),
                hora_termina: moment(props.distribucion.hora_termina, "HH:mm"),
            });

            filterDocentes(props.distribucion.id_carrera); // Filtra docentes por carrera al cargar
            fetchMateriasPorCurso(props.distribucion.id_nivel); // Cargar materias por curso al cargar la distribución
        }
    });
}, [props.distribucion, form]);

const onFinish = async (values) => {
    try {
        const response = await fetch(`${url}horario/update_distribucion/${props.distribucion.id_distribucion}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...values,
                hora_inicio: values.hora_inicio.format("HH:mm"),
                hora_termina: values.hora_termina.format("HH:mm"),
                id_materia: parseInt(values.materia, 10),
                id_nivel: values.nivel, // Agregar el ID del curso
                id_docente: values.docente, // Agregar el ID del docente
                id_carrera: values.carrera, 
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "Error al actualizar la distribución");
        }

        if (data.ok) {
            notification.success({
                message: 'Actualización exitosa',
                description: 'Distribución actualizada correctamente.',
            });
            props.getData(); // Asegúrate de que props.getData esté disponible
            props.handleCloseModal(); // Cierra el modal
        } else {
            throw new Error(data.mensaje || "No se pudo actualizar la distribución.");
        }
    } catch (error) {
        notification.error({
            message: 'Error',
            description: error.message,
        });
    }
};

return (
    <Spin spinning={loading} tip={mensajeLoading}>
        <Modal
            title="Editar Distribución"
            open={props.open}
            onCancel={props.handleCloseModal}
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
                    <Input disabled defaultValue="Contenido visible aquí" />
                </Form.Item>

                <Form.Item
                    label="Carrera"
                    name="carrera"
                    rules={[{ required: true, message: 'Por favor ingrese la carrera' }]}
                >
                    <Select 
                        placeholder="Seleccione una carrera"
                        onChange={(value) => {
                            setCarreraSelect(value);
                            filterDocentes(value); // Llama a la función para filtrar docentes por carrera
                        }}
                    >
                        {carrera.map(c => (
                            <Option key={c.value} value={c.value}>
                                {c.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Curso"
                    name="nivel"
                    rules={[{ required: true, message: 'Por favor ingrese el curso' }]}
                >
                    <Select 
                        placeholder="Seleccione un curso"
                        value={cursoSelect} // Preselección del curso
                        onChange={(value) => {
                            setCursoSelect(value);
                            fetchMateriasPorCurso(value); // Llama a la función para filtrar materias
                        }}
                    >
                        {cursos.map(curso => (
                            <Option key={curso.value} value={curso.value}>
                                {curso.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Materia"
                    name="materia"
                    rules={[{ required: true, message: 'Por favor seleccione una materia' }]}
                >
                    <Select placeholder="Seleccione una materia">
                        {materias.map(materia => (
                            <Option key={materia.value} value={materia.value}>
                                {materia.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Docente"
                    name="docente"
                    rules={[{ required: true, message: 'Por favor seleccione el docente' }]}
                >
                    <Select placeholder="Seleccione un docente" >
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
                        <Select.Option value="Sábado">Sábado</Select.Option>
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
    </Spin>
);
};

export default UpdateDistribucion;