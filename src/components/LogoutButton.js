import React from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';

const LogoutButton = ({ onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (!response.ok) throw new Error('Logout failed');

            onLogout(); // Llama la función para eliminar el token
            notification.success({ message: 'Sesión cerrada con éxito.' });
            navigate('/'); // Redirige al login
        } catch (error) {
            notification.error({ message: error.message });
        }
    };

    return <button onClick={handleLogout}>Cerrar Sesión</button>;
};

export default LogoutButton;
