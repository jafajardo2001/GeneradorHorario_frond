import { Card, Space, Form, Input, Button,Row,Col,Avatar,Select } from "antd";
import React,{useEffect,useState} from "react";
import {  Navigate, useNavigate } from "react-router-dom";
import "../../public/css/login.css";
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import pre from "../../public/img/pre-lg-istg.png";
import Title from "antd/es/skeleton/Title";

const { Meta } = Card;
const { Option } = Select;

const Login = () => {
  const navigate = useNavigate();
  const url = "http://localhost:8000/api/istg/";

  const onFinish = (values) => {
    fetch(`${url}auth_login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    })
    .then(response => response.json())
    .then(data => {
      if (data.ok) {
        localStorage.setItem("autenticacion", true);
        navigate("/dashboard"); // Redirige al dashboard si la autenticación es exitosa
      } else {
        window.alert(data.message); // Muestra el mensaje de error
      }
    })
    .catch((error) => {
      window.alert("Hubo un error en la comunicación con el servidor.");
      console.error("Error en la autenticación:", error);
    });
  };
  

  return (
    <div className="body">
      <div className="container-login">
        <Card className="card" cover={<img alt="Logo" src={pre} />}>
          <Meta
            title={<label><LoginOutlined style={{ marginRight: '10px' }} />Iniciar Sesión</label>}
            description={
              <Form
                onFinish={onFinish}
                layout="vertical"
                className="login-form"
              >
                <Form.Item
                  label="Correo"
                  name="correo"
                  rules={[{ required: true, message: 'Por favor, ingrese su correo' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Correo" />
                </Form.Item>
                <Form.Item
                  label="Contraseña"
                  name="clave"
                  rules={[{ required: true, message: 'Por favor, ingrese su contraseña' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<LoginOutlined />}
                    style={{ width: '100%' }}
                  >
                    Ingresar
                  </Button>
                </Form.Item>
              </Form>
            }
          />
        </Card>
      </div>
    </div>
  );
};

export default Login;
