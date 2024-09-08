import React, { useEffect, useState } from "react";
import { Button, notification } from "antd";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GenerarReporte = ({ filteredData }) => {
    const url = "http://localhost:8000/api/istg/";
    const [loading, setLoading] = useState(true);
    const [filterDocente, setFilterDocente] = useState("");

    const formatearHora = (hora) => {
        return hora.slice(0, 5); // Esto corta los primeros 5 caracteres (HH:MM)
    };
    
    function getDistribucion() {
        setLoading(true);
        fetch(`${url}horario/show_dist_horarios`, { method: 'GET' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then((data) => {
                let Distribucion = data.data.map((value, index) => {
                    return {
                        index: index + 1,
                        id_distribucion: value?.id_distribucion,
                        educacion_global: value?.educacion_global_nombre,
                        carrera: value?.nombre_carrera,
                        id_usuario: value?.id_usuario,
                        materia: value?.materia,
                        nivel: value?.nivel,
                        paralelo: value?.paralelo,
                        dia: value?.dia,
                        hora_inicio: formatearHora(value?.hora_inicio), // Formatear la hora de inicio
                        hora_termina: formatearHora(value?.hora_termina), // Formatear la hora de término
                        fecha_actualizacion: new Date(value?.fecha_actualizacion).toLocaleDateString(),
                        usuarios_ultima_gestion: value?.usuarios_ultima_gestion,
                        estado: value?.estado,
                        docente: value?.nombre_docente,
                        cedula: value?.cedula_docente,
                        correo: value?.correo_docente,
                        telefono: value?.telefono_docente,
                        titulo_academico: value?.titulo_academico_docente,
                    };
                });
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const calcularHoras = (datos) => {
        let horasDocencia = 0;
        let horasInvestigacion = 0;
        let horasPracticas = 0;
        let horasGestion = 0;
    
        datos.forEach(item => {
            const horasPorClase = item.hora_termina && item.hora_inicio ? 
                (new Date(`1970-01-01T${item.hora_termina}:00`) - new Date(`1970-01-01T${item.hora_inicio}:00`)) / 3600000 : 0;
    
            if (item.tipo_actividad === 'Docencia') {
                horasDocencia += horasPorClase;
            } else if (item.tipo_actividad === 'Investigación') {
                horasInvestigacion += horasPorClase;
            } else if (item.tipo_actividad === 'Prácticas Preprofesionales') {
                horasPracticas += horasPorClase;
            } else if (item.tipo_actividad === 'Gestión Administrativa') {
                horasGestion += horasPorClase;
            }
        });
    
        return {
            horasDocencia: horasDocencia.toFixed(2),
            horasInvestigacion: horasInvestigacion.toFixed(2),
            horasPracticas: horasPracticas.toFixed(2),
            horasGestion: horasGestion.toFixed(2),
            totalHoras: (horasDocencia + horasInvestigacion + horasPracticas + horasGestion).toFixed(2),
        };
    };

    const handleGenerateReport = () => {
        if (!filteredData || filteredData.length === 0) {
            notification.error({
                message: 'Error',
                description: 'No hay datos para generar el reporte.',
                placement: 'topRight',
            });
            return;
        }

        const horas = calcularHoras(filteredData);
        const doc = new jsPDF('landscape');

            // Ordenar los datos por la hora de inicio
        filteredData.sort((a, b) => {
            const horaA = new Date(`1970-01-01T${a.hora_inicio}:00`).getTime();
            const horaB = new Date(`1970-01-01T${b.hora_inicio}:00`).getTime();
            return horaA - horaB;
        });

        // Sección 1: Datos Generales
        const docente = filteredData[0]; // Usar el primer registro para los datos generales
        doc.autoTable({
            startY: 40,
            head: [["1. DATOS GENERALES"]],
            headStyles: { fillColor: [0, 191, 255], halign: 'center', fontStyle: 'bold', textColor: [255, 255, 255] },
            body: []
        });

        doc.autoTable({
            startY: doc.previousAutoTable.finalY,
            body: [
                [{ content: 'CÉDULA:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, docente.cedula],
                [{ content: 'Apellidos y Nombres:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, docente.docente],
                [{ content: 'TÍTULO TERCER NIVEL:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, docente.titulo_academico],
                [{ content: 'TÍTULO CUARTO NIVEL:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, ''],
                [{ content: 'CORREO:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, docente.correo],
                [{ content: 'TELÉFONO:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, docente.telefono],
                [{ content: 'ASIGNATURAS:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, docente.materia],
                [{ content: 'TIEMPO DE DEDICACIÓN:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, 'TIEMPO COMPLETO'],
                [{ content: 'CARRERA:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, docente.educacion_global],
                [{ content: 'PERÍODO ACADÉMICO:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, '2023-S2']
            ],
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' }
            },
            styles: {
                cellPadding: 5,
                fontSize: 10,
                overflow: 'linebreak'
            }
        });

        // Sección 2: Resumen de Horas de Dedicación Semanal
        doc.autoTable({
            startY: doc.previousAutoTable.finalY + 5,
            head: [["2. RESUMEN DE HORAS DE DEDICACIÓN SEMANAL"]],
            headStyles: { fillColor: [0, 191, 255], halign: 'center', fontStyle: 'bold', textColor: [255, 255, 255] },
            body: []

        });

        doc.autoTable({
            startY: doc.previousAutoTable.finalY,
            head: [['Docencia', 'Investigación', 'Prácticas Preprofesionales', 'Gestión Administrativa', 'Total de Horas']],
            body: [
                [ `Horas Clase: ${horas.horasDocencia}`, `Director de Investigación: ${horas.horasInvestigacion}`, `Director de Proyectos Comunitarios: ${horas.horasPracticas}`, `Coordinación: ${horas.horasGestion}`, `Total: ${horas.totalHoras}` ],
                [ `Tutorías: 1`, '', `Tutor de Prácticas Laborales: 4`, `Gestoría Institucional: 0`, '' ],
                [ `Preparación de Clases: 5`, '', '', '', '' ]
            ],
            
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 'auto' },
                4: { cellWidth: 'auto' }
            },
            styles: {
                cellPadding: 4,
                fontSize: 10,
                overflow: 'linebreak'
            }
        });

        const normalizarDia = (dia) => {
            const diasSemana = {
                'lunes': 'Lunes',
                'martes': 'Martes',
                'miércoles': 'Miércoles',
                'jueves': 'Jueves',
                'viernes': 'Viernes',
                'sábado': 'Sábado'
            };
            return diasSemana[dia.toLowerCase()] || dia;
        };
        
        filteredData.forEach(row => {
            const horario = `${row.hora_inicio}
            ${row.hora_termina}`;
            const diaNormalizado = normalizarDia(row.dia);
            if (!normalizarDia[horario]) {
                normalizarDia[horario] = { 'Lunes': '', 'Martes': '', 'Miércoles': '', 'Jueves': '', 'Viernes': '', 'Sábado': '' };
            }
            normalizarDia[horario][diaNormalizado] += (normalizarDia[horario][diaNormalizado] ? ', ' : '') + row.materia;
        });

        const tablaDistribucion = Object.keys(normalizarDia).map(horario => [
            horario, 
            normalizarDia[horario]['Lunes'], 
            normalizarDia[horario]['Martes'], 
            normalizarDia[horario]['Miércoles'], 
            normalizarDia[horario]['Jueves'], 
            normalizarDia[horario]['Viernes'], 
            normalizarDia[horario]['Sábado']
        ]);

        // Sección 3: Distribución de Actividades Docentes
        doc.autoTable({
            startY: doc.previousAutoTable.finalY + 5,
            head: [["3. DISTRIBUTIVO DE LAS ACTIVIDADES DOCENTES"]],
            headStyles: { fillColor: [0, 191, 255], halign: 'center', fontStyle: 'bold', textColor: [255, 255, 255] },
            body: []
        });

        doc.autoTable({
            startY: doc.previousAutoTable.finalY,
            head: [['Horario', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']],
            body: tablaDistribucion,
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 'auto' },
                3: { cellWidth: 'auto' },
                4: { cellWidth: 'auto' },
                5: { cellWidth: 'auto' },
                6: { cellWidth: 'auto' }
            },
            styles: {
                cellPadding: 2,
                fontSize: 10,
                overflow: 'linebreak'
            }
        });

        doc.save('reporte.pdf');
    };

    useEffect(() => {
        getDistribucion();
    }, [filterDocente]);

    return (
        <div>
            <Button type="primary" onClick={handleGenerateReport} loading={loading}>
                Generar Reporte
            </Button>
        </div>
    );
};

export default GenerarReporte;
