import React, { useRef, useEffect, useState } from "react";
import { Modal, Form, Input, Select, Row, Col, Typography, notification } from "antd";

const NewPeriodo = (props) => {
  const { Title } = Typography;
  const Formulario = useRef(null);
  const [years, setYears] = useState([]);
  const url = "http://localhost:8000/api/istg/";

  // Genera una lista de años desde 2023 hasta el año actual + 10
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: 10 }, (_, i) => currentYear + i);
    setYears(availableYears);
  }, []);

  const createPeriodo = (value) => {
    fetch(`${url}create_periodo_electivo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anio: String(value.year),  // Enviar el año como string
        periodo: value.periodo,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.ok) {
          notification.success({
            message: "Periodo Creado",
            description: `El periodo "${value.periodo}" del año ${value.year} ha sido creado con éxito.`,
          });
          props.getPeriodos(); // Refrescar lista de periodos
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
      title="Nuevo Periodo Electivo"
    >
      <Form onFinish={createPeriodo} ref={Formulario} layout="vertical">
        <Row>
          <Col span={24}>
            <Form.Item
              label="Seleccione el año"
              rules={[{ required: true, message: "El campo del año es requerido" }]}
              name="year"
            >
              <Select placeholder="Seleccione el año" allowClear>
                {years.map((year) => (
                  <Select.Option key={year} value={year}>
                    {year}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Ingrese el periodo"
              rules={[{ required: true, message: "El campo del periodo es requerido" }]}
              name="periodo"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default NewPeriodo;
