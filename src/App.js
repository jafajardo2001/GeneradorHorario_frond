import React, { useState, useEffect } from "react";
import { Route, Routes, BrowserRouter as Router, Navigate } from "react-router-dom";
import Usuarios from "./views/Mantenimientos/Usuarios";
import Perfiles from "./views/Mantenimientos/Perfiles";
import Tiempojob from "./views/Mantenimientos/Tiempojob";
import Cursos from "./views/Mantenimientos/Cursos";
import Paralelos from "./views/Mantenimientos/Paralelos";
import Materias from "./views/Mantenimientos/Materias";
import EducacionGlobal from "./views/Mantenimientos/EducacionGlobal";
import TitulosAcademicos from "./views/Mantenimientos/TitulosAcademicos";
import Horarios from "./views/Mantenimientos/Horarios";
import Calendario from "./views/Mantenimientos/Calendario";
import NewEducacionGlobal from "./views/Formularios/NewEducacionGlobal";
import Aside from "./components/Aside";
import PlanificacionAcademica from "./views/Planificaciones/PlanificacionAcademica";
import Login from "./components/Login"; // Importar el componente de Login
import axios from "axios";

function App() {
  // Estado para manejar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Comprobar si hay un token de autenticación en el localStorage
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true); // Si existe el token, marcar como autenticado
    }
  }, []);

  // Función para manejar el éxito del login y almacenar el token
  const handleLoginSuccess = (token) => {
    localStorage.setItem("authToken", token);
    setIsAuthenticated(true);
  };

  // Componente de orden superior para proteger las rutas
  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      {/* Si no está autenticado, mostrar solo el login */}
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <Aside>
          <Routes>
            <Route path="/Mantenimientos/usuarios" element={<ProtectedRoute element={<Usuarios />} />} />
            <Route path="/Mantenimientos/perfiles" element={<ProtectedRoute element={<Perfiles />} />} />
            <Route path="/Mantenimientos/tiempojob" element={<ProtectedRoute element={<Tiempojob />} />} />
            <Route path="/Mantenimientos/cursos" element={<ProtectedRoute element={<Cursos />} />} />
            <Route path="/Mantenimientos/paralelos" element={<ProtectedRoute element={<Paralelos />} />} />
            <Route path="/Mantenimientos/educacionGobal" element={<ProtectedRoute element={<EducacionGlobal />} />} />
            <Route path="/Mantenimientos/materias" element={<ProtectedRoute element={<Materias />} />} />
            <Route path="/Mantenimientos/tituloacademico" element={<ProtectedRoute element={<TitulosAcademicos />} />} />
            <Route path="/Mantenimientos/calendario" element={<ProtectedRoute element={<Calendario />} />} />
            <Route path="/Mantenimientos/horarios" element={<ProtectedRoute element={<Horarios />} />} />
            <Route path="/Formulario/crearEducacionGobal" element={<ProtectedRoute element={<NewEducacionGlobal />} />} />
            <Route path="/Planificaciones/PlanificacionAcademia" element={<ProtectedRoute element={<PlanificacionAcademica />} />} />
          </Routes>
        </Aside>
      )}
    </Router>
  );
}

export default App;
