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
    
    const getDistribucion = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${url}horario/show_dist_horarios`, { method: 'GET' });
            if (!response.ok) throw new Error('Network response was not ok ' + response.statusText);
            const data = await response.json();
            const distribucion = data.data.map((value, index) => ({
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
                titulo: value?.titulo_academico_docente
            }));
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
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

        const doc = new jsPDF();

        // Sección 1: Datos Generales
        const docente = filteredData[0]; // Usar el primer registro para los datos generales
        doc.autoTable({
            startY: 40,
            head: [{
                content: '1. DATOS GENERALES',
                styles: { fillColor: [60, 179, 113], halign: 'center', fontStyle: 'bold', textColor: [255, 255, 255] }
            }],
            body: [
                [{ content: 'CÉDULA:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, docente.cedula],
                [{ content: 'Apellidos y Nombres:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, docente.docente],
                [{ content: 'TÍTULO TERCER NIVEL:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, docente.titulo_academico],
                [{ content: 'TÍTULO CUARTO NIVEL:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, ''],
                [{ content: 'CORREO:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, 'rtigrero@istg.edu.ec'],
                [{ content: 'TELÉFONO:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, '0989007630'],
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
            head: [{
                content: '2. RESUMEN DE HORAS DE DEDICACIÓN SEMANAL',
                styles: { fillColor: [60, 179, 113], halign: 'center', fontStyle: 'bold', textColor: [255, 255, 255] }
            }],
            body: []
        });

        doc.autoTable({
            startY: doc.previousAutoTable.finalY,
            head: [['Docencia', 'Investigación', 'Prácticas Preprofesionales', 'Gestión Administrativa', 'Total de Horas']],
            body: [
                ['Horas Clase: 18', 'Director de Investigación: 2', 'Director de Proyectos Comunitarios: 4', 'Coordinación: 0', 'Total: 24'],
                ['Tutorías: 1', '', 'Tutor de Prácticas Laborales: 4', 'Gestoría Institucional: 0', ''],
                ['Preparación de Clases: 5', '', '', '', '']
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
            const horario = `${row.hora_inicio} - ${row.hora_termina}`;
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
            head: [{
                content: '3. DISTRIBUTIVO DE LAS ACTIVIDADES DOCENTES',
                styles: { fillColor: [60, 179, 113], halign: 'center', fontStyle: 'bold', textColor: [255, 255, 255] }
            }],
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
