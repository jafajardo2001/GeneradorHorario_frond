import React, { useRef, useEffect, useState } from "react";
import { Modal, Form, Col, Row, Input, Select, notification } from "antd";
import { SyncOutlined, PlusCircleOutlined, ClearOutlined, SearchOutlined, EditOutlined, DeleteOutlined, MenuOutlined } from "@ant-design/icons";

const UpdatePeriodo = (props) => {
  const formRef = useRef(null);
  const [id, setId] = useState(0);
  const [years, setYears] = useState([]);
  const url = "http://localhost:8000/api/istg/";

  // Genera una lista de años desde 2023 hasta el año actual + 10
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: 10 }, (_, i) => currentYear + i);
    setYears(availableYears);

    // Cuando el formulario se carga, asignar el valor del formulario
    if (formRef.current) {
      setId(props.formulario.id);
      // Asegúrate de que se establezcan tanto el año como el periodo en el formulario
      formRef.current.setFieldsValue({
        year: props.formulario.anio,  // Asegúrate de que el campo 'year' esté en 'formulario'
        periodo: props.formulario.periodo,

      });
    }
  }, [props.formulario]);

  const update = (value) => {
    fetch(`${url}update_periodo_electivo/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        anio: String(value.year), // Enviar el año como string
        periodo: value.periodo,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          notification.success({
            message: 'Actualización Exitosa',
            description: data.message || 'Periodo actualizado correctamente.',
            placement: 'topRight',
          });
          formRef.current.resetFields();
          props.handleCloseModal();
          props.getPeriodos(); // Refrescar la lista de periodos
        } else {
          notification.error({
            message: 'Error',
            description: data.message || 'No se pudo actualizar el periodo.',
            placement: 'topRight',
          });
        }
      })
      .catch((error) => {
        notification.error({
          message: 'Error',
          description: 'Ocurrió un error al actualizar el periodo: ' + error.message,
          placement: 'topRight',
        });
      });
  };

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
      title="Actualizar Periodo Electivo" 
      okText="Actualizar" 
      cancelText="Cancelar"
    >
      <Form 
        onFinish={update} 
        initialValues={{ remember: true }} 
        ref={formRef} 
        layout="vertical"
      >
        <Row>
          <Col span={24}>
            <Form.Item 
              label="Selecciona el año" 
              rules={[{ required: true, message: "El campo del año es requerido" }]}

              name="year" // Este es el campo para el año
            >
              <Select placeholder="Selecciona el año" allowClear>
                {years.map(year => (
                  <Select.Option key={year} value={year}>
                    {year}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item 
              label="Edite el periodo" 
              rules={[{ required: true, message: "El campo del periodo es requerido" }]}

              name="periodo" // Este es el campo para el periodo
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default UpdatePeriodo;
