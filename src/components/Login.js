import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/autenticar_sistema_istg', {
                correo: values.correo,
            });
            const { rol } = response.data;
            message.success(`Bienvenido ${rol}`);
            // Redireccionar según el rol
            if (rol === 'admin') {
                navigate('/admin/dashboard');
            } else if (rol === 'docente') {
                navigate('/docente/dashboard');
            } else if (rol === 'alumno') {
                navigate('/alumno/dashboard');
            } else {
                message.error('Rol no reconocido.');
            }
        } catch (error) {
            message.error('Correo no registrado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            name="login"
            onFinish={onFinish}
        >
            <Form.Item
                name="correo"
                rules={[{ required: true, message: 'Por favor ingresa tu correo' }]}
            >
                <Input placeholder="Correo electrónico" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Ingresar
                </Button>
            </Form.Item>
        </Form>
    );
};

export default Login;
