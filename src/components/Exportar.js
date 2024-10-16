import React, { useEffect, useState } from "react";
import { Button, notification } from "antd";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const GenerarReporte = ({ filteredData }) => {
    const url = "http://localhost:8000/api/istg/";
    const [loading, setLoading] = useState(true);
    const [filterDocente, setFilterDocente] = useState("");
    const [coordinador, setCoordinador] = useState({});
    const [coordinador2, setCoordinador2] = useState({});
    const [gestorth, setGestorth] = useState({});

    const formatearHora = (hora) => {
        return hora.slice(0, 5); // Esto corta los primeros 5 caracteres (HH:MM)
    };

    function getUser() {
        setLoading(true);
        fetch(`${url}show_coordinadorc`, { method: 'GET' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                let informacion = data.data.map((value) => ({
                    id: value.id_usuario,
                    nombre_completo: value.nombre_completo,
                }));

                if (informacion.length > 0) {
                    setCoordinador(informacion[0]); // Almacenas el primer coordinador
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function getUser2() {
        setLoading(true);
        fetch(`${url}show_coordinador_a`, { method: 'GET' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                let informaciondos = data.data.map((value) => ({
                    id: value.id_usuario,
                    nombre_completo: value.nombre_completo,
                }));

                if (informaciondos.length > 0) {
                    setCoordinador2(informaciondos[0]); // Almacenas el primer coordinador
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

    function getUser3() {
        setLoading(true);
        fetch(`${url}show_gestorth`, { method: 'GET' })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                let informaciondos = data.data.map((value) => ({
                    id: value.id_usuario,
                    nombre_completo: value.nombre_completo,
                }));

                if (informaciondos.length > 0) {
                    setGestorth(informaciondos[0]); // Almacenas el primer gestor
                }
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    }

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
                        job_descripcion: value?.job_descripcion,
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
        let horasPorMateria = {};
        let horasMateriaExcluidas = {
            'Proyectos de Investigación': 0,
            'Práctica Servicios Comunitarios': 0,
            'Coordinación': 0,
            'Tutorías': 0,
            'Prácticas Laborales': 0,
            'Trabajo de Titulación': 0,
            'Gestoría Institucional': 0,
            'Preparación de Clases': 0,
            'Horas Clase': 0 // Asegúrate de incluir esta categoría
        };
        let horasOtrasDocencia = 0;

        // Define las actividades que se consideran como "Otras Actividades de Docencia"
        const otrasActividadesDocenciaList = [
            'apoyo a tics',
            'ayudar a direccion',
            // Agrega más actividades según tus necesidades
        ];

        datos.forEach(item => {
            const horasPorClase = item.hora_termina && item.hora_inicio ?
                (new Date(`1970-01-01T${item.hora_termina}:00`) - new Date(`1970-01-01T${item.hora_inicio}:00`)) / 3600000 : 0;

            const materiaLower = item.materia.toLowerCase();

            if (item.materia in horasMateriaExcluidas) {
                horasMateriaExcluidas[item.materia] += horasPorClase;
            } else if (otrasActividadesDocenciaList.includes(materiaLower)) {
                horasOtrasDocencia += horasPorClase;
            } else {
                if (!horasPorMateria[item.materia]) {
                    horasPorMateria[item.materia] = 0;
                }
                horasPorMateria[item.materia] += horasPorClase;
            }
        });

        const totalHorasExcluidas = Object.values(horasMateriaExcluidas).reduce((acc, horas) => acc + horas, 0).toFixed(2);
        const totalHorasRestantes = Object.values(horasPorMateria).reduce((acc, horas) => acc + horas, 0).toFixed(2);
        const totalHorasOtrasDocencia = horasOtrasDocencia.toFixed(2);

        // Calcular las sumas por columna incluyendo "Otras Actividades de Docencia"
        const totalHorasClase = horasMateriaExcluidas['Horas Clase'] || 0;
        const totalHorasTutorias = horasMateriaExcluidas['Tutorías'] || 0;
        const totalHorasPreparacionClases = horasMateriaExcluidas['Preparación de Clases'] || 0;
        const totalHorasDirectorInvestigacion = horasMateriaExcluidas['Proyectos de Investigación'] || 0;
        const totalHorasDirectorProyectos = horasMateriaExcluidas['Práctica Servicios Comunitarios'] || 0;
        const totalHorasCoordinacion = horasMateriaExcluidas['Coordinación'] || 0;
        const totalHorasTutorPracticas = horasMateriaExcluidas['Prácticas Laborales'] || 0;
        const totalHorasGestoriaInstitucional = horasMateriaExcluidas['Gestoría Institucional'] || 0;
        const totalHorasTrabajodeTitulación = horasMateriaExcluidas['Trabajo de Titulación'] || 0;

        // Sumar las horas totales incluyendo "Otras Actividades de Docencia"
        const totalDocencia = (parseFloat(totalHorasRestantes) + parseFloat(totalHorasTutorias) + parseFloat(totalHorasPreparacionClases) + parseFloat(totalHorasOtrasDocencia)).toFixed(2);
        const totalInvestigacion = (parseFloat(totalHorasDirectorInvestigacion) + parseFloat(totalHorasTrabajodeTitulación)).toFixed(2);
        const totalPracticas = (parseFloat(totalHorasTutorPracticas) + parseFloat(totalHorasDirectorProyectos)).toFixed(2);
        const totalGestion = (parseFloat(totalHorasGestoriaInstitucional) + parseFloat(totalHorasCoordinacion)).toFixed(2);
        const totalGeneral = (parseFloat(totalDocencia) + parseFloat(totalInvestigacion) + parseFloat(totalPracticas) + parseFloat(totalGestion)).toFixed(2);

        return {
            horasPorMateria,
            horasMateriaExcluidas,
            horasOtrasDocencia,
            totalHorasExcluidas,
            totalHorasRestantes,
            totalHorasOtrasDocencia,
            totalHorasClase,
            totalHorasTutorias,
            totalHorasPreparacionClases,
            totalHorasDirectorInvestigacion,
            totalHorasDirectorProyectos,
            totalHorasCoordinacion,
            totalHorasTutorPracticas,
            totalHorasTrabajodeTitulación,
            totalHorasGestoriaInstitucional,
            totalDocencia,
            totalInvestigacion,
            totalPracticas,
            totalGestion,
            totalGeneral
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

        const {
            horasPorMateria,
            horasMateriaExcluidas,
            horasOtrasDocencia,
            totalHorasExcluidas,
            totalHorasRestantes,
            totalHorasOtrasDocencia,
            totalHorasClase,
            totalHorasTutorias,
            totalHorasPreparacionClases,
            totalHorasDirectorInvestigacion,
            totalHorasDirectorProyectos,
            totalHorasTrabajodeTitulación,
            totalHorasCoordinacion,
            totalHorasTutorPracticas,
            totalHorasGestoriaInstitucional,
            totalDocencia,
            totalInvestigacion,
            totalPracticas,
            totalGestion,
            totalGeneral
        } = calcularHoras(filteredData);

        const doc = new jsPDF('landscape');

        // Ordenar los datos por la hora de inicio
        filteredData.sort((a, b) => {
            const horaA = new Date(`1970-01-01T${a.hora_inicio}:00`).getTime();
            const horaB = new Date(`1970-01-01T${b.hora_inicio}:00`).getTime();
            return horaA - horaB;
        });

        // Crear una promesa para asegurar que la imagen se cargue antes de continuar con la generación del PDF
        const img = new Image();
        img.src = '/logo-istg-2.png';  // Ruta del logo en la carpeta public

        img.onload = function () {
            doc.addImage(img, 'PNG', 120, 7, 50, 12);  // Ajustar posición y tamaño del logo

            // Sección 1: Datos Generales
            const docente = filteredData[0]; // Usar el primer registro para los datos generales
            doc.autoTable({
                startY: 23,
                head: [["1. DATOS GENERALES"]],
                headStyles: { fillColor: [32, 149, 211], halign: 'center', fontStyle: 'bold', textColor: [255, 255, 255] },
                body: []
            });

            doc.autoTable({
                startY: doc.previousAutoTable.finalY,
                body: [
                    [
                        { content: 'CÉDULA:', styles: { halign: 'left', fillColor: [240, 240, 240] } },
                        docente.cedula,
                        { content: 'TÍTULO TERCER NIVEL:', styles: { halign: 'left', fillColor: [240, 240, 240] } },
                        docente.titulo_academico
                    ],
                    [
                        { content: 'Apellidos y Nombres:', styles: { halign: 'left', fillColor: [240, 240, 240] } },
                        docente.docente,
                        { content: 'TÍTULO CUARTO NIVEL:', styles: { halign: 'left', fillColor: [240, 240, 240] } },
                        '' // Deja vacío si no hay información
                    ],
                    [
                        { content: 'CORREO:', styles: { halign: 'left', fillColor: [240, 240, 240] } },
                        docente.correo,
                        { content: 'TELÉFONO:', styles: { halign: 'left', fillColor: [240, 240, 240] } },
                        docente.telefono
                    ],
                    [
                        { content: 'ASIGNATURAS:', styles: { halign: 'left', fillColor: [240, 240, 240] } },
                        docente.materia,
                        { content: 'TIEMPO DE DEDICACIÓN:', styles: { halign: 'left', fillColor: [240, 240, 240] } },
                        docente.job_descripcion
                    ],
                    [
                        { content: 'CARRERA:', styles: { halign: 'left', fillColor: [240, 240, 240] } },
                        docente.carrera,
                        { content: 'PERÍODO ACADÉMICO:', styles: { halign: 'left', fillColor: [240, 240, 240] } },
                        docente.periodo_electivo
                    ]
                ],
                columnStyles: {
                    0: { cellWidth: 60 }, // Ajusta el ancho de las celdas de la primera columna
                    1: { cellWidth: 74 }, // Ajusta el ancho de las celdas de la segunda columna
                    2: { cellWidth: 60 }, // Ajusta el ancho de las celdas de la tercera columna
                    3: { cellWidth: 74 }  // Ajusta el ancho de las celdas de la cuarta columna
                },
                styles: {
                    cellPadding: 0.5,
                    fontSize: 8,
                    overflow: 'linebreak',
                    lineColor: [0, 0, 0], // Color de las líneas de la tabla
                    lineWidth: 0.2 // Grosor de las líneas
                }
            });

            // Sección 2: Resumen de Horas de Dedicación Semanal
            doc.autoTable({
                startY: doc.previousAutoTable.finalY + 3,
                head: [["2. RESUMEN DE HORAS DE DEDICACIÓN SEMANAL"]],
                headStyles: { fillColor: [32, 149, 211], halign: 'center', fontStyle: 'bold', textColor: [255, 255, 255] },
                body: []
            });

            doc.autoTable({
                startY: doc.previousAutoTable.finalY,
                head: [['2.1 Docencia', '2.2 Investigación', '2.3 Prácticas Preprofesionales', '2.4 Gestión Administrativa', 'Total de Horas']],
                headStyles: { halign: 'center' },
                body: [
                    [`Horas Clase: ${totalHorasRestantes}`, `Director de Investigación: ${totalHorasDirectorInvestigacion}`, `Director de Proyectos Comunitarios: ${totalHorasDirectorProyectos}`, `Coordinación: ${totalHorasCoordinacion}`, `Total de Horas: ${totalGeneral}`], 
                    [`Tutorías: ${totalHorasTutorias}`, `Trabajos de Titulación: ${totalHorasTrabajodeTitulación}`, `Tutor de Prácticas Laborales: ${totalHorasTutorPracticas}`, `Gestoría Institucional: ${totalHorasGestoriaInstitucional}`, ''],
                    [`Preparación de Clases: ${totalHorasPreparacionClases}`,  '', '', '', ''],
                    [`Otras Actividades de Docencia: ${totalHorasOtrasDocencia}`, '', '', '', ''], // Actualizado aquí
                    [`Total: ${totalDocencia}`, `Total: ${totalInvestigacion}`, `Total: ${totalPracticas}`, `Total: ${totalGestion}`]
                ],

                columnStyles: {
                    0: { cellWidth: 'auto' },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 'auto' },
                    3: { cellWidth: 'auto' },
                    4: { cellWidth: 'auto' }
                },
                styles: {
                    cellPadding: 0.5,
                    fontSize: 8,
                    overflow: 'linebreak',
                    lineColor: [0, 0, 0], // Color de las líneas de la tabla
                    lineWidth: 0.2 // Grosor de las líneas
                }
            });

            // Sección 3: Distribución de Actividades Docentes
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

            let distribucionHorarios = {};
            let horasPorDia = {
                'Lunes': 0,
                'Martes': 0,
                'Miércoles': 0,
                'Jueves': 0,
                'Viernes': 0,
                'Sábado': 0
            };

            filteredData.forEach(row => {
                const horario = `${row.hora_inicio} - ${row.hora_termina}`;
                const diaNormalizado = normalizarDia(row.dia);

                if (!distribucionHorarios[horario]) {
                    distribucionHorarios[horario] = {
                        'Lunes': '',
                        'Martes': '',
                        'Miércoles': '',
                        'Jueves': '',
                        'Viernes': '',
                        'Sábado': ''
                    };
                }
                distribucionHorarios[horario][diaNormalizado] += (distribucionHorarios[horario][diaNormalizado] ? ', ' : '') + row.materia 
                + " " + row.niveln + " " + row.paralelo;

                const horaInicio = new Date(`1970-01-01T${row.hora_inicio}:00`);
                const horaFin = new Date(`1970-01-01T${row.hora_termina}:00`);
                const duracionHoras = (horaFin - horaInicio) / 3600000;
                horasPorDia[diaNormalizado] += duracionHoras;
            });

            const tablaDistribucion = Object.keys(distribucionHorarios).map(horario => [
                horario,
                distribucionHorarios[horario]['Lunes'] || '',
                distribucionHorarios[horario]['Martes'] || '',
                distribucionHorarios[horario]['Miércoles'] || '',
                distribucionHorarios[horario]['Jueves'] || '',
                distribucionHorarios[horario]['Viernes'] || '',
                distribucionHorarios[horario]['Sábado'] || ''
            ]);

            // Agregar la fila de totales al final de la tabla
            const tablaDistribucionConTotales = [
                ...tablaDistribucion,
                [
                    'Totales',
                    `Total de Horas: ${horasPorDia['Lunes'].toFixed(1)} h`,
                    `Total de Horas: ${horasPorDia['Martes'].toFixed(1)} h`,
                    `Total de Horas: ${horasPorDia['Miércoles'].toFixed(1)} h`,
                    `Total de Horas: ${horasPorDia['Jueves'].toFixed(1)} h`,
                    `Total de Horas: ${horasPorDia['Viernes'].toFixed(1)} h`,
                    `Total de Horas: ${horasPorDia['Sábado'].toFixed(1)} h`,
                ]
            ];

            doc.autoTable({
                startY: doc.previousAutoTable.finalY + 3,
                head: [["3. DISTRIBUTIVO DE LAS ACTIVIDADES DOCENTES"]],
                headStyles: { fillColor: [32, 149, 211], halign: 'center', fontStyle: 'bold', textColor: [255, 255, 255] },
                body: []
            });

            doc.autoTable({
                startY: doc.previousAutoTable.finalY,
                head: [['Horario', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']],
                headStyles: { halign: 'center' },
                body: tablaDistribucionConTotales,
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
                    cellPadding: 0.3,
                    fontSize: 7,
                    overflow: 'linebreak',
                    lineColor: [0, 0, 0], // Color de las líneas de la tabla
                    lineWidth: 0.2 // Grosor de las líneas
                }
            });

            // Sección de firmas
            const firmaY = doc.previousAutoTable.finalY + 20; // Aumenta el valor para mover más abajo

            // Firmas en la parte inferior
            const firmaEspacio = 70; // Espacio entre cada firma

            doc.setFontSize(8);

            // Firma izquierda (Coordinador Académico)
            doc.text("________________________", 50, firmaY); // Línea de subrayado
            doc.setFont('helvetica', 'bold');
            doc.text(coordinador2.nombre_completo || '', 50, firmaY + 5); // Nombre del coordinador académico
            doc.text(`Coordinador Académico`, 50, firmaY + 10); // Coordinador académico etiqueta
            doc.setFont("helvetica", "normal");

            // Firma central (Coordinador de Carrera)
            doc.text("________________________", 100, firmaY); // Línea de subrayado
            doc.setFont('helvetica', 'bold');
            doc.text(coordinador.nombre_completo || '', 100, firmaY + 5); // Nombre del coordinador de carrera
            doc.text(`Coordinador de Carrera`, 100, firmaY + 10); // Coordinador de carrera etiqueta
            doc.setFont("helvetica", "normal");

            // Firma central (Gestor de Talento Humano)
            doc.text("________________________", 150, firmaY); // Línea de subrayado
            doc.setFont('helvetica', 'bold');
            doc.text(gestorth.nombre_completo || '', 150, firmaY + 5); // Nombre del gestor de talento humano
            doc.text(`Gestora de la Unidad de Talento Humano`, 150, firmaY + 10); // Gestora de talento humano etiqueta
            doc.setFont("helvetica", "normal");

            // Firma derecha (Docente)
            doc.text("________________________", 215, firmaY); // Línea de subrayado
            doc.setFont('helvetica', 'bold');
            doc.text(`${docente.docente}`, 215, firmaY + 5); // Nombre del docente
            doc.text(`Docente`, 215, firmaY + 10); // Docente etiqueta
            doc.setFont("helvetica", "normal");

            doc.save('reporte.pdf');
        };
    };

    useEffect(() => {
        getDistribucion();
        getUser();
        getUser2();
        getUser3();
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
