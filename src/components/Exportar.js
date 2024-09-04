// src/components/GenerarReporte.js
import React, { useEffect, useState } from "react";
import { Typography, Row, Card, Space, Col, Button, Table, Dropdown, Menu, Spin, notification, Modal, Input } from "antd";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GenerarReporte = ({ filteredData }) => {
    const url = "http://localhost:8000/api/istg/";
    const [loading, setLoading] = useState(true);
    const [filterDocente, setFilterDocente] = useState("");
    
    

    
    /*async function showInstituto() {
        setLoading(true)
        try {
            let configuraciones = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            let response = await fetch(`${url}show_data_instituto`, configuraciones);
            let data = await response.json();

            if (data.data) {
                let data_mapeada = data.data.map((value, index) => ({
                    value: value.id_educacion_global,
                    label: `${value.nombre} (${value.nemonico})`
                }));
                setInstitucion(data_mapeada);
            }
            setLoading(false)
            return true;
        } catch (error) {
            return false;
        }
    }*/

    /*async function showCarreras() {
        try {
            setLoading(true)
            let configuraciones = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            let response = await fetch(`${url}show_carrera`, configuraciones);
            let data = await response.json()
            if (data.data) {
                let data_mapeada = data.data.map((value, index) => ({
                    value: value.id_carrera,
                    label: value.nombre,
                }))
                setCarrera(data_mapeada)
            }
            return true
        } catch (error) {
            return false
        }
    }*/

    /*async function showMaterias() {
        try {
            setLoading(true)
            let configuraciones = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            let response = await fetch(`${url}show_data_asignatura`, configuraciones);
            let data = await response.json()
            if (data.data) {
                let data_mapeada = data.data.map((value, index) => ({
                    value: value.id_materia,
                    label: value.descripcion,
                }))
                setAsignatura(data_mapeada)
            }
            return true
        } catch (error) {
            return false
        }
    }*/

    /*async function showCursos() {
        try {
            setLoading(true)
            let configuraciones = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            let response = await fetch(`${url}show_nivel/`, configuraciones);
            let data = await response.json()
            if (data.data) {
                let data_mapeada = data.data.map((value, index) => ({
                    value: value.id_nivel,
                    label: value.nemonico + " " + value.termino,
                }))
                setCursos(data_mapeada)
            }
            return true
        } catch (error) {
            return false
        }
    }*/

    /*async function showParalelos() {
        try {
            setLoading(true)
            let configuraciones = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            let response = await fetch(`${url}showParalelo`, configuraciones);
            let data = await response.json()
            if (data.data) {
                let data_mapeada = data.data.map((value, index) => ({
                    value: value.id_paralelo,
                    label: value.paralelo,
                }))
                setParalelos(data_mapeada)
            }
            return true
        } catch (error) {
            return false
        }
    }*/

    /*async function showUser() {
        try {
            setLoading(true); // Indicar que los datos están cargando
    
            let configuraciones = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                }
            };
    
            let response = await fetch(`${url}show_docentes`, configuraciones);
            let data = await response.json();
    
            if (response.ok && data.ok) {  // Verifica que la respuesta y el JSON sean correctos
                let data_mapeada = data.data.map((value) => ({
                    value: value.id_usuario,
                    label: value.nombre_completo, // Usando nombre_completo de la función showDocentes
                }));
                setUser(data_mapeada); // Establecer los datos mapeados en el estado user
            } else {
                console.error("Error en la respuesta del servidor:", data.message || "Error desconocido");
            }
    
            setLoading(false); // Indicar que los datos han terminado de cargar
            return true;
        } catch (error) {
            console.error("Error al obtener los datos de los docentes:", error);
            setLoading(false); // Indicar que los datos han terminado de cargar incluso si hay error
            return false;
        }
    }*/

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
                        hora_inicio: value?.hora_inicio,
                        hora_termina: value?.hora_termina,
                        fecha_actualizacion: new Date(value?.fecha_actualizacion).toLocaleDateString(),
                        usuarios_ultima_gestion: value?.usuarios_ultima_gestion,
                        estado: value?.estado,
                        docente: value?.nombre_docente,
                        cedula: value?.cedula_docente,
                        titulo: value?.titulo_academico_docente
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
        doc.autoTable({
            startY: 40,
            head: [{
                content: '1. DATOS GENERALES',  
                styles: { fillColor: [60, 179, 113], halign: 'center', fontStyle: 'bold', textColor: [255, 255, 255] }
            }],
            body: filteredData.map(row => [
                [{ content: 'CÉDULA:', styles: { halign: 'left', fillColor: [240, 240, 240] } },  row.cedula ],
                [{ content: 'Apellidos y Nombres:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, row.docente ],
                [{ content: 'TÍTULO TERCER NIVEL:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, row.titulo_academico ],
                [{ content: 'TÍTULO CUARTO NIVEL:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, { content: '' }],
                [{ content: 'CORREO:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, { content: 'rtigrero@istg.edu.ec' }],
                [{ content: 'TELÉFONO:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, { content: '0989007630' }],
                [{ content: 'ASIGNATURAS:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, row.materia ],
                [{ content: 'TIEMPO DE DEDICACIÓN:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, { content: 'TIEMPO COMPLETO' }],
                [{ content: 'CARRERA:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, row.educacion_global_nombre ],
                [{ content: 'PERÍODO ACADÉMICO:', styles: { halign: 'left', fillColor: [240, 240, 240] } }, { content: '2023-S2' }]
            ]),
            columnStyles: {
                0: { cellWidth: 60 },
                1: { cellWidth: 'auto' },
            },
            styles: {
                cellPadding: 3,
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
                cellPadding: 3,
                fontSize: 10,
                overflow: 'linebreak'
            },
        });

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
            body: filteredData.map(row => [
                [row.hora_inicio + "-" + row.hora_termina, ''],
            ]),
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
                cellPadding: 3,
                fontSize: 10,
                overflow: 'linebreak'
            },
        });

        doc.save('reporte-distributivo.pdf');
    };

    useEffect(() => {
        getDistribucion();
    }, [filterDocente]); // Agregar filterDocente como dependencia para actualizar la tabla al cambiar el filtro

    return (
        <Button type="primary" onClick={handleGenerateReport}>
            Generar Reporte
        </Button>
    );
};

export default GenerarReporte;
