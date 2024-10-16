import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, TimePicker, Button, notification, Spin } from "antd";
import moment from "moment";

const { Option } = Select;

function UpdateDistribucion(props) {
  const [loading, setLoading] = useState(true);
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [carrera, setCarrera] = useState([]);
  const [paralelo, setParalelo] = useState([]);
  const [form] = Form.useForm(); 
  const url = "http://localhost:8000/api/istg/";
  
  const handleCloseModal = () => {
    form.resetFields();
    props.handleCloseModal();
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCursos(), fetchCarreras(), fetchParalelos()])
      .then(() => {
        if (props.distribucion) {
          form.setFieldsValue({
            educacion_global: props.distribucion.educacion_global,
            carrera: props.distribucion.id_carrera,
            materia: props.distribucion.id_materia,
            docente: props.distribucion.id_docente,
            paralelo: props.distribucion.id_paralelo, // Usar el ID del paralelo para preselección
            nivel: props.distribucion.id_nivel,
            dia: props.distribucion.dia,
            hora_inicio: moment(props.distribucion.hora_inicio, "HH:mm"),
            hora_termina: moment(props.distribucion.hora_termina, "HH:mm"),
          });

          filterDocentes(props.distribucion.id_carrera);
          fetchMateriasPorCurso(props.distribucion.id_nivel);
        }
      })
      .finally(() => setLoading(false));
  }, [props.distribucion, form]);

  const filterDocentes = async (idCarrera) => {
    try {
      const response = await fetch(`${url}obtener_docentes_por_carrera/${idCarrera}`);
      const data = await response.json();

      if (response.ok && data.ok) {
        const docentesMapeados = data.data.map((value) => ({
          value: value.id_usuario,
          label: `${value.nombre_completo} ${value.titulo_academico}`,
        }));
        setDocentes(docentesMapeados);
      } else {
        setDocentes([]);
      }
    } catch (error) {
      setDocentes([]);
    }
  };

  const fetchMateriasPorCurso = async (idCurso) => {
    try {
      const response = await fetch(`${url}obtener_materias_por_nivel/${idCurso}`);
      const data = await response.json();

      if (response.ok && data.ok) {
        const materiasMapeadas = data.data.map((value) => ({
          value: value.id_materia,
          label: value.descripcion,
        }));
        setMaterias(materiasMapeadas);
      } else {
        setMaterias([]);
      }
    } catch (error) {
      setMaterias([]);
    }
  };

  const fetchCarreras = async () => {
    try {
      const response = await fetch(`${url}show_carrera`);
      const data = await response.json();

      if (response.ok && data.ok) {
        const carrerasMapeadas = data.data.map((value) => ({
          value: value.id_carrera,
          label: `${value.nombre} (${value.descripcion_jornada})`,
        }));
        setCarrera(carrerasMapeadas);
      }
    } catch (error) {
      notification.error({
        message: 'Error al cargar carreras',
        description: error.message,
      });
    }
  };

  const fetchParalelos = async () => {
    try {
      const response = await fetch(`${url}showParalelo`);
      const data = await response.json();
      
      if (response.ok && data.ok) {
        const paralelosMapeados = data.data.map((value) => ({
          value: Number(value.id_paralelo),      // Asegura que el tipo coincida
          label: value.paralelo,              // Cambia 'descripcion' al campo correcto
        }));
        setParalelo(paralelosMapeados);
      }
    } catch (error) {
      notification.error({
        message: 'Error al cargar paralelos',
        description: error.message,
      });
    }
  };

  const fetchCursos = async () => {
    try {
      const response = await fetch(`${url}show_nivel`);
      const data = await response.json();

      if (response.ok && data.ok) {
        const cursosMapeados = data.data.map((value) => ({
          value: value.id_nivel,
          label: `${value.nemonico} ${value.termino}`,
        }));
        setCursos(cursosMapeados);
      }
    } catch (error) {
      notification.error({
        message: 'Error al cargar cursos',
        description: error.message,
      });
    }
  };

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
          id_periodo: props.distribucion.id_periodo,
          id_docente: values.docente,
          id_paralelo: values.paralelo,
          id_nivel: values.nivel, // Usar el ID del paralelo, no la descripción
          id_carrera: values.carrera,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.mensaje || "Error al actualizar la distribución");

      notification.success({
        message: 'Distribución actualizada',
        description: 'Distribución actualizada correctamente.',
      });
      props.getData();
      handleCloseModal();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message,
      });
    }
  };

  return (
    <Spin spinning={loading} tip="Cargando...">
      <Modal
        title="Editar Distribución"
        open={props.open}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Educación Global"
            name="educacion_global"
            rules={[{ required: true, message: 'Por favor ingrese la educación global' }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Carrera"
            name="carrera"
            rules={[{ required: true, message: 'Por favor ingrese la carrera' }]}
          >
            <Select disabled>
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
            rules={[{ required: true, message: 'Por favor seleccione un curso' }]}
          >
            <Select onChange={fetchMateriasPorCurso}>
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
            <Select>
              {materias.map(materia => (
                <Option key={materia.value} value={materia.value}>
                  {materia.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Paralelo"
            name="paralelo"
            rules={[{ required: true, message: 'Por favor seleccione un paralelo' }]}
          >
            <Select>
              {paralelo.map(paralelo => (
                <Option key={paralelo.value} value={paralelo.value}>
                  {paralelo.label} {/* Mostrar el texto del paralelo */}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Docente"
            name="docente"
            rules={[{ required: true, message: 'Por favor seleccione un docente' }]}
          >
            <Select>
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
              <Option value="Lunes">Lunes</Option>
              <Option value="Martes">Martes</Option>
              <Option value="Miércoles">Miércoles</Option>
              <Option value="Jueves">Jueves</Option>
              <Option value="Viernes">Viernes</Option>
              <Option value="Sábado">Sábado</Option>
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
}

export default UpdateDistribucion;
