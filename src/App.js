import { Route, Routes,BrowserRouter as Router } from "react-router-dom";
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
import Login from "./views/externos/Login";
function App() {

  return (
    <Router>
      <Routes><Route path="/" element={<Login />}/></Routes>
      <Aside>
        <Routes>
          <Route path="/Mantenimientos/usuarios" element={<Usuarios />}/>
          <Route path="/Mantenimientos/perfiles" element={<Perfiles />}/>
          <Route path="/Mantenimientos/tiempojob" element={<Tiempojob />}/>
          <Route path="/Mantenimientos/cursos" element={<Cursos />}/>
          <Route path="/Mantenimientos/paralelos" element={<Paralelos />}/>
          <Route path="/Mantenimientos/educacionGobal" element={<EducacionGlobal />}/>
          <Route path="/Mantenimientos/materias" element={<Materias/>}/>
          <Route path="/Mantenimientos/tituloacademico" element={<TitulosAcademicos/>}/>
          <Route path="/Mantenimientos/calendario" element={<Calendario/>}/> 
          <Route path="/Mantenimientos/horarios" element={<Horarios/>}/>
          <Route path="/Formulario/crearEducacionGobal" element={<NewEducacionGlobal/>}/>
          <Route path="/Planificaciones/PlanificacionAcademia" element={<PlanificacionAcademica/>}/>
        </Routes>
      </Aside>
    </Router>
  );
}

export default App;
