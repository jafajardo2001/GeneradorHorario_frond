import { CiCircleOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined, InfoOutlined, InsertRowRightOutlined, LeftOutlined, LoadingOutlined, LogoutOutlined, OrderedListOutlined, RightOutlined, VerifiedOutlined } from "@ant-design/icons";
import Icon from "@ant-design/icons/lib/components/Icon";
import { render } from "@testing-library/react";
import { Button, Form, Modal, Result, Row, Select, Space, Spin, Steps, Table, Tree, Typography, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import Title from "antd/es/skeleton/Title";
import React, { useEffect, useRef, useState } from "react";
import { dias, hora_inicio, hora_termina } from './datos';

const NewPlanificacionAcademica = (props) => {
    const { Title } = Typography;
    const [pasosCurret, setPasosCurret] = useState(0);
    const [institucion, setInstitucion] = useState([]);
    const [carrera, setCarrera] = useState([]);
    const [asignatura, setAsignatura] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [paralelos, setParalelos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dataSource, setDataSource] = useState([]);
    const [institucionSelect, setInstitucionSelect] = useState([])
    const [carreraSelect, setCarreraSelect] = useState([]);
    const [userSelect, setUserSelect] = useState({});
    const formulario = useRef(null);
    const [docentesFiltrados, setDocentesFiltrados] = useState([]);
    const [isDocenteSelectEnabled, setIsDocenteSelectEnabled] = useState(false); // Estado para controlar si el select de docentes está habilitado
    const [informativo, setInformativo] = useState({})
    const [modalIsOpen, setIsOpen] = useState(props.open)
    const [user, setUser] = useState([]);
    const url = "http://localhost:8000/api/istg/";
    const [pasos, setPasos] = useState([
        {
            title: 'parametros',
            status: 'proces',
            icon: <EditOutlined />,
        },
        {
            title: 'orden',
            status: 'wait',
            icon: <OrderedListOutlined />,
        },
        {
            title: 'finalizar',
            status: 'wait',
            icon: <VerifiedOutlined />,
        }
    ])
    const [columns, setColumns] = useState([
        {
            dataIndex: "materia",
            title: "Escoja la Materia",
            align: "center",
            width: 20,
            render: (text, record, index) => (
                <Select defaultValue={text}></Select>
            )
        }
    ]);

    useEffect(() => {
        setIsOpen(props.open)
    }, [props.open])
    const addRow = () => {
        const newRow = {
            key: dataSource.length + 1,
            materia: "", // Dejar vacío para que se seleccione
            curso: "",
            paralelos: ""
        };
        setDataSource([...dataSource, newRow]);
    };

    function seguirOpciones(paso) {
        if (paso === 1) {
            setPasos([{
                title: 'parametros',
                status: 'proces',
                icon: <EditOutlined />,
            },
            {
                title: 'Validando informacion',
                status: 'proces',
                icon: <LoadingOutlined />,
            },
            {
                title: 'Respuesta',
                status: 'wait',
                icon: <VerifiedOutlined />,
            }]);
        }
        if (paso === 2) {
            console.log("entro en el segudno if")
            setPasos([
                {
                    title: 'parametros',
                    status: 'proces',
                    icon: <EditOutlined />,
                },
                {
                    title: 'Validacion realizada',
                    status: 'proces',
                    icon: <OrderedListOutlined />,
                },
                {
                    title: 'Respuesta',
                    status: 'proces',
                    icon: <VerifiedOutlined />,
                }]);
        }

        if (0) {
            setPasos([
                {
                    title: 'parametros',
                    status: 'proces',
                    icon: <EditOutlined />,
                },
                {
                    title: 'Validacion Finalizada',
                    status: 'proces',
                    icon: <OrderedListOutlined />,
                },
                {
                    title: 'Respuesta',
                    status: 'wait',
                    icon: <VerifiedOutlined />,
                }
            ]);
            //setPasosCurret(0)
        }
        setPasosCurret(paso)
    }

    async function showInstituto() {
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
    }

    async function showCarreras() {
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
                    label: `${value.nombre} (${value.descripcion_jornada})`,
                }))
                setCarrera(data_mapeada)
            }
            return true
        } catch (error) {
            return false
        }
    }



    async function showCursos() {
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
    }
    async function obtenerMateriasPorNivel(idNivel) {
        try {
            console.log("Obteniendo materias por nivel:", idNivel);
            setLoading(true); // Indicador de carga

            // Configuración de la petición
            let configuraciones = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            // Hacer la solicitud a la API, pasando el idNivel como parámetro
            let response = await fetch(`${url}obtener_materias_por_nivel/${idNivel}`, configuraciones);
            let data = await response.json();

            if (response.ok && data.ok) {
                // Mapeo de las materias obtenidas
                let data_mapeada = data.data.map((value) => ({
                    value: value.id_materia,
                    label: value.descripcion,
                }));

                setAsignatura(data_mapeada); // Actualizar el estado con las materias filtradas
            }
            else {
                console.error("Error en la respuesta del servidor:", data.message || "Error desconocido");
            }

            setLoading(false); // Finalizar la carga
        }
        catch (error) {
            console.error("Error al obtener las materias por nivel:", error);
            setLoading(false); // Finalizar la carga en caso de error
        }
    }

    async function showParalelos() {
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
    }

    async function obtenerDocentesPorCarrera(idCarrera) {
        try {
            setLoading(true); // Indicador de carga

            // Configuración de la petición
            let configuraciones = {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            // Hacer la solicitud a la API, pasando el idCarrera como parámetro
            let response = await fetch(`${url}obtener_docentes_por_carrera/${idCarrera}`, configuraciones);
            let data = await response.json();

            if (response.ok && data.ok) {
                // Mapeo de los docentes obtenidos
                let data_mapeada = data.data.map((value) => ({
                    value: value.id_usuario,
                    label: value.nombre_completo + " - " + value.titulo_academico, // Nombre completo y título académico
                }));

                setUser(data_mapeada); // Actualizar el estado con los docentes filtrados
            } else {
                console.error("Error en la respuesta del servidor:", data.message || "Error desconocido");
            }

            setLoading(false); // Finalizar la carga
        } catch (error) {
            console.error("Error al obtener los docentes por carrera:", error);
            setLoading(false); // Finalizar la carga en caso de error
        }
    }







    async function createPlanificacionAcademica() {
        try {
            seguirOpciones(1);

            // Crear un arreglo de objetos con la información mapeada
            let arreglo_obj = [];
            dataSource.forEach(element => {
                let mapeoData = element.paralelos.map((valor) => {
                    return {
                        id_usuario: userSelect,  // Asegúrate de que este valor es el esperado
                        id_instituto: institucionSelect,
                        id_carrera: carreraSelect,
                        id_materia: element.materia,
                        id_curso: element.curso,
                        id_paralelo: valor,
                        id_periodo_electivo: 1,
                        dia: element.dias,
                        hora_inicio: element.hora_inicio,
                        hora_termina: element.hora_termina,
                        estado: "A",
                    };
                });
                arreglo_obj.push(mapeoData);
            });
            const arregloUnido = arreglo_obj.reduce((acc, current) => acc.concat(current), []);

            // Enviar la solicitud POST
            let response = await fetch(`${url}horario/create_horario`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    data: arregloUnido,
                    id_usuario: userSelect // Incluye el ID del usuario aquí
                })
            });

            // Procesar la respuesta del servidor
            let data = await response.json();
            if (data.ok) {
                setInformativo({
                    status: "success",
                    title: "Operación Realizada con éxito",
                    subTitle: data.mensaje,
                });
                props.getData(); // Asegúrate de que props.getData esté disponible
            props.handleCloseModal(); 
            } else if (data.mensaje_error.includes("límite de materias")) {  // Validar si el error es por límite
                setInformativo({
                    status: "warning",
                    title: "Límite de materias alcanzado",
                    subTitle: data.mensaje_error,  // Mostrar el mensaje específico del límite
                });
            } else {
                setInformativo({
                    status: "warning",
                    title: "Ha ocurrido un error",
                    subTitle: data.mensaje_error,
                });
            }
        } catch (error) {
            setInformativo({
                status: "warning",
                title: "Ha ocurrido un error",
                subTitle: "Error interno en el servidor",
            });
            console.error('Error:', error); // Agrega esto para ver detalles del error
        }
        seguirOpciones(2);
    }


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await showInstituto();
            await showCarreras();
            await showCursos();
            await showParalelos();
            setLoading(false);
        };

        fetchData();

    }, [])
    return (
        <>
            <Modal open={modalIsOpen} okText="siguiente" footer={false} closeIcon={false} size="small" onOk={seguirOpciones} okButtonProps={loading} width={1000}
            >
                <Spin spinning={loading} tip="Cargando..." size="large" style={{
                    alignItems: "center",
                    justifyContent: "center",
                    justifyItems: "center",
                    display: "block"
                }} />
                <Steps
                    size="medium"
                    items={pasos}
                    current={pasosCurret}
                />
                <br />
                {
                    pasosCurret === 0 && (
                        <Form layout="horizontal" ref={formulario} labelAlign="center">
                            <Form.Item label="Escoja el Instituto" labelCol={{ span: 5 }} name="instituto">
                                <Select
                                    onChange={(value) => {
                                        setInstitucionSelect(value)
                                    }}
                                    options={institucion} name="instituto" disabled={loading} />
                            </Form.Item>

                            <Form.Item label="Escoja las carreras" labelCol={{ span: 5 }} name="carreras">
                                <Select
                                    showSearch
                                    options={carrera}
                                    name="carrera"
                                    disabled={loading}
                                    onChange={(value) => {
                                        setCarreraSelect(value); // Guardar la carrera seleccionada
                                        obtenerDocentesPorCarrera(value); // Llamar a la función para obtener los docentes filtrados
                                        setIsDocenteSelectEnabled(true); // Activar el select de docentes
                                    }}
                                />
                            </Form.Item>

                            <Form.Item label="Escoja al docente de la carrera" labelCol={{ span: 5 }} name="coor_carrera">
                                <Select
                                    showSearch
                                    options={user} // Aquí se muestran los docentes filtrados
                                    name="coor_carrera"
                                    disabled={loading || !isDocenteSelectEnabled} // Habilitar solo si se seleccionó una carrera
                                    onChange={(value) => {
                                        setUserSelect(value); // Guardar el docente seleccionado
                                    }}
                                />
                            </Form.Item>


                            <Button onClick={addRow} icon={<InsertRowRightOutlined />}>Agregar Fila</Button>
                            <Table

                                pagination={false}
                                bordered={false}
                                scroll={{ x: 1000 }}
                                columns={[
                                    {
                                        dataIndex: "curso",
                                        title: "Cursos",
                                        align: "center",
                                        width: 10,
                                        render: (text, record, index) => (

                                            <Select
                                                options={cursos} // Las opciones de los cursos
                                                defaultValue={"Escoja el curso"}
                                                onChange={(value) => {
                                                    const newData = [...dataSource];
                                                    newData[index]["curso"] = value;
                                                    setDataSource(newData);

                                                    obtenerMateriasPorNivel(value); // Llamar la función para obtener materias por el curso seleccionado
                                                }}
                                            ></Select>
                                        )
                                    },
                                    {
                                        dataIndex: "materia",
                                        title: "Materias",
                                        align: "center",
                                        width: 25,
                                        render: (text, record, index) => (
                                            <Select
                                                options={asignatura} // Las materias filtradas se mostrarán aquí
                                                defaultValue={"Escoja una asignatura"}
                                                onChange={(value) => {
                                                    const newData = [...dataSource];
                                                    newData[index]["materia"] = value;
                                                    setDataSource(newData);
                                                }}
                                            ></Select>
                                        )
                                    },
                                    {
                                        dataIndex: "paralelos",
                                        title: "Paralelos",
                                        align: "center",
                                        width: 250,
                                        render: (text, record, index) => (
                                            <Select
                                                style={{
                                                    width: "100%"
                                                }}
                                                mode="multiple"
                                                options={paralelos}
                                                onChange={(value) => {
                                                    const newData = [...dataSource];
                                                    newData[index]["paralelos"] = value;
                                                    setDataSource(newData);
                                                }}
                                            ></Select>
                                        )
                                    },
                                    {
                                        dataIndex: "dias",
                                        title: "Días",
                                        align: "center",
                                        width: 350,
                                        render: (text, record, index) => (
                                            <Select
                                                style={{
                                                    width: "100%"
                                                }}
                                                options={dias}
                                                value={record.dias || undefined} // Utiliza el valor actual de la fila
                                                onChange={(value) => {
                                                    const newData = [...dataSource];
                                                    newData[index]["dias"] = value;
                                                    setDataSource(newData);
                                                }}
                                            />
                                        )
                                    },
                                    {
                                        dataIndex: "hora_inicio",
                                        title: "Inicia",
                                        align: "center",
                                        width: 450,
                                        render: (text, record, index) => (
                                            <Select
                                                style={{
                                                    width: "100%"
                                                }}
                                                options={hora_inicio}
                                                value={record.hora_inicio || undefined} // Utiliza el valor actual de la fila
                                                onChange={(value) => {
                                                    const newData = [...dataSource];
                                                    newData[index]["hora_inicio"] = value;
                                                    setDataSource(newData);
                                                }}
                                            />
                                        )
                                    },
                                    {
                                        dataIndex: "hora_termina",
                                        title: "Termina",
                                        align: "center",
                                        width: 450,
                                        render: (text, record, index) => (
                                            <Select
                                                style={{
                                                    width: "100%"
                                                }}
                                                options={hora_termina}
                                                value={record.hora_termina || undefined} // Utiliza el valor actual de la fila
                                                onChange={(value) => {
                                                    const newData = [...dataSource];
                                                    newData[index]["hora_termina"] = value;
                                                    setDataSource(newData);
                                                }}
                                            />
                                        )
                                    },
                                    {
                                        dataIndex: "acciones",
                                        title: "Acciones",
                                        align: "center",
                                        width: 5,
                                        render: (text, record, index) => (
                                            <Button onClick={() => {
                                                console.log("Soy el index")
                                                console.log(index)
                                                console.log(dataSource)
                                                if (index == 0) {
                                                    index = 1
                                                }
                                                setDataSource(dataSource.filter((values) => {
                                                    return values.key != index
                                                }).map((valor, index) => {
                                                    return {
                                                        curso: valor.curso,
                                                        key: index + 1,
                                                        materia: valor.materia,
                                                        paralelos: valor.paralelos
                                                    }
                                                }))


                                            }}><DeleteOutlined /></Button>
                                        )
                                    }
                                ]}
                                dataSource={dataSource}
                                size="large"
                            />


                            <Row style={{
                                display: "flex",
                                flexDirection: "column-reverse",
                                alignItems: "flex-end"
                            }}>
                                <Space>
                                    <Button disabled={loading} onClick={props.handleCloseModal} danger type="primary" htmlType="submit"><LeftOutlined /> Cancelar</Button>
                                    <Button disabled={loading} onClick={createPlanificacionAcademica} type="primary" htmlType="submit"><RightOutlined /> siguiente paso</Button>
                                </Space>
                            </Row>

                        </Form>

                    )
                }
                {
                    pasosCurret === 1 && (
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            color: "green"
                        }}>
                            <Title level={5}>Esto puede demorar unos minutos porfavor espere</Title>
                        </div>
                    )
                }
                {
                    pasosCurret === 2 && (
                        <Result
                            status={informativo.status}
                            title={informativo.title}
                            subTitle={informativo.subTitle}
                            extra={[
                                <Button type="primary" key="console" onClick={() => {
                                    props.handleCloseModal()
                                    setDataSource([])
                                    setUserSelect([])
                                    setInstitucionSelect([])
                                    setCarreraSelect([])
                                    seguirOpciones(0)
                                }}>Aceptar</Button>
                            ]}
                        />
                    )
                }

            </Modal>
        </>)
}

export default NewPlanificacionAcademica;