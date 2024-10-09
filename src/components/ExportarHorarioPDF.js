import React, { useEffect, useState } from "react";
import { Button, notification } from "antd";
import { FilePdfOutlined } from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ExportarHorarioPDF  = ({ filteredData }) => {
    const [loading, setLoading] = useState(false);

    const formatearHora = (hora) => {
        return hora.slice(0, 5); // Formatear HH:MM
    };

    const handleExportPDF  = () => {
        if (!filteredData || filteredData.length === 0) {
            notification.error({
                message: 'Error',
                description: 'No hay datos para generar el horario.',
                placement: 'topRight',
            });
            return;
        }

        const doc = new jsPDF('landscape');

        // Ordenar los datos por hora de inicio
        filteredData.sort((a, b) => {
            const horaA = new Date(`1970-01-01T${a.hora_inicio}:00`).getTime();
            const horaB = new Date(`1970-01-01T${b.hora_inicio}:00`).getTime();
            return horaA - horaB;
        });

        const img = new Image();
        img.src = '/logo-istg-2.png';  // Ruta del logo

        img.onload = function () {
            doc.addImage(img, 'PNG', 30, 10, 100, 20);  // Ajustar posición y tamaño del logo
            doc.setFontSize(16);
            doc.text("Distribución de Horarios", 30, 50);

            // Función para normalizar los días de la semana
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

            // Organizar los horarios por día y hora
            let distribucionHorarios = {};

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
                distribucionHorarios[horario][diaNormalizado] += (distribucionHorarios[horario][diaNormalizado] ? ', ' : '') + row.materia + " "
                    + row.nivel + row.paralelo;
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

            doc.autoTable({
                startY: 60,  // Ajusta la posición de la tabla
                head: [['Horario', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']],
                body: tablaDistribucion, // Usar solo tablaDistribucion
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
                    cellPadding: 1,
                    fontSize: 8,
                    overflow: 'linebreak',
                    lineColor: [0, 0, 0],
                    lineWidth: 0.2
                }
            });

            doc.save('horario.pdf');
        };
    };

    return (
        <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
        Generar Horario en PDF
    </Button>
    );
};

export default ExportarHorarioPDF;
