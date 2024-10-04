import React, { useState, useEffect } from 'react';
import { Modal, Select } from 'antd';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const { Option } = Select;

// Función para convertir un día de la semana en una fecha específica
const getDayDate = (day) => {
  const today = new Date();
  const currentDay = today.getDay(); // Domingo = 0, Lunes = 1, etc.
  const daysOfWeek = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];
  const targetDay = daysOfWeek.indexOf(day.toUpperCase());

  if (targetDay === -1) return null;

  const difference = targetDay - currentDay;
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + difference);
  return targetDate.toISOString().split('T')[0]; // YYYY-MM-DD
};

// Componente que renderiza un calendario dinámico basado en los eventos obtenidos del backend
const MyDynamicCalendar = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dataTable, setDataTable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocente, setSelectedDocente] = useState(''); // Estado para el docente seleccionado
  const [docentes, setDocentes] = useState([]); // Estado para la lista de docentes
  const [filterDocente, setFilterDocente] = useState(""); // Nuevo estado para el filtro
  const [filteredData, setFilteredData] = useState([]); // Inicializado como un array vacío
  const url = "http://localhost:8000/api/istg/horario/show_dist_horarios";

  // Función para obtener distribuciones y filtrarlas
  function getDistribucion() {
    setLoading(true);
    fetch(url, { method: 'GET' })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        let Distribucion = data.data.map((value, index) => ({
          index: index + 1,
          id_distribucion: value?.id_distribucion,
          educacion_global: value?.educacion_global_nombre,
          carrera: value?.nombre_carrera,
          id_usuario: value?.id_usuario,
          materia: value?.materia,
          nivel: value?.nivel,
          paralelo: value?.paralelo,
          dia: value?.dia,
          hora_inicio: value?.hora_inicio,
          hora_termina: value?.hora_termina,
          fecha_actualizacion: new Date(value?.fecha_actualizacion).toLocaleDateString(),
          usuarios_ultima_gestion: value?.usuarios_ultima_gestion,
          estado: value?.estado,
          docente: value?.nombre_docente
        }));

        // Filtrar datos según el filtro de docente
        if (filterDocente) {
          Distribucion = Distribucion.filter(item => 
            item.docente.toLowerCase().includes(filterDocente.toLowerCase())
          );
        }

        setDataTable(Distribucion);
        setFilteredData(Distribucion); // Actualizar también el estado filteredData

        // Formatear los eventos para el calendario
        const formattedEvents = Distribucion.map(item => {
          const date = getDayDate(item.dia);
          if (!date) return null;

          const startTime = item.hora_inicio.replace('24:', '00:');
          const endTime = item.hora_termina.replace('24:', '00:');

          return {
            id: item.id_distribucion,
            title: item.materia,
            start: `${date}T${startTime}`,
            end: `${date}T${endTime}`,
            allDay: false,
            extendedProps: {
              docente: item.docente,
              instituto: item.educacion_global,
              carrera: item.carrera,
              nivel: item.nivel,
              paralelo: item.paralelo,
              fechaActualizacion: item.fecha_actualizacion
            }
          };
        }).filter(event => event !== null);

        setEvents(formattedEvents);
        setFilteredEvents(formattedEvents);

        // Extraer y setear la lista de docentes
        const uniqueDocentes = [...new Set(Distribucion.map(item => item.docente))];
        setDocentes(uniqueDocentes);
      })
      .catch(error => console.error("Error fetching data:", error))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    getDistribucion();
  }, [filterDocente]);

  useEffect(() => {
    // Filtrar eventos según el docente seleccionado
    if (selectedDocente) {
      const filtered = events.filter(event => event.extendedProps.docente === selectedDocente);
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [selectedDocente, events]);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleModalClose = () => {
    setSelectedEvent(null);
  };

  return (
    <>
      <Select
        placeholder="Selecciona un docente"
        style={{ width: 200, marginBottom: 20 }}
        onChange={value => {
          setSelectedDocente(value);
          setFilterDocente(value); // Actualizar el filtro
        }}
      >
        {docentes.map(docente => (
          <Option key={docente} value={docente}>{docente}</Option>
        ))}
      </Select>

      <div id="calendar">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: '',
            right: 'timeGridWeek,timeGridDay'
          }}
          views={{
            timeGridWeek: {
              buttonText: 'Semana'
            },
            timeGridDay: {
              buttonText: 'Día'
            }
          }}
          events={filteredEvents}
          eventClick={handleEventClick}
        />
      </div>

      <Modal
        title={selectedEvent?.title || 'Detalles del Evento'}
        visible={!!selectedEvent}
        onCancel={handleModalClose}
        footer={null}
      >
        {selectedEvent ? (
          <>
            <p><strong>Docente:</strong> {selectedEvent.extendedProps.docente}</p>
            <p><strong>Instituto:</strong> {selectedEvent.extendedProps.instituto}</p>
            <p><strong>Carrera:</strong> {selectedEvent.extendedProps.carrera}</p>
            <p><strong>Nivel:</strong> {selectedEvent.extendedProps.nivel}</p>
            <p><strong>Paralelo:</strong> {selectedEvent.extendedProps.paralelo}</p>
            <p><strong>Fecha de Actualización:</strong> {selectedEvent.extendedProps.fechaActualizacion}</p>
          </>
        ) : (
          <p>No hay detalles disponibles.</p>
        )}
      </Modal>
    </>
  );
};

export default MyDynamicCalendar;
