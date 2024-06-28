import { useEffect, useState } from 'react';
import Styles from './TODO.module.css';
import axios from 'axios';

export function TODO(props) {

    const [newTodo, setNewTodo] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [todoData, setTodoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingTodo, setEditingTodo] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');

    console.log("todoData", todoData);

    useEffect(() => {
        const fetchTodo = async () => {
            const apiData = await getTodo();
            setTodoData(apiData);
            setLoading(false);
        };
        fetchTodo();
    }, []);

    const getTodo = async () => {
        const options = {
            method: "GET",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            }
        };
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (err) {
            console.log(err);
            return []; // return an empty array in case of error
        }
    };

    const addTodo = () => {
        const options = {
            method: "POST",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            },
            data: {
                title: newTodo,
                description: newDescription
            }
        };
        axios
            .request(options)
            .then(response => {
                console.log(response.data);
                setTodoData(prevData => [...prevData, response.data]);
                setNewTodo('');
                setNewDescription('');
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const deleteTodo = (id) => {
        const options = {
            method: "DELETE",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            }
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => prevData.filter(todo => todo._id !== id));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const updateTodo = (id, newTitle = null, newDescription = null) => {
        const todoToUpdate = todoData.find(todo => todo._id === id);
        const options = {
            method: "PATCH",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            },
            data: {
                ...todoToUpdate,
                title: newTitle !== null ? newTitle : todoToUpdate.title,
                description: newDescription !== null ? newDescription : todoToUpdate.description,
                done: newTitle === null && newDescription === null ? !todoToUpdate.done : todoToUpdate.done
            }
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => prevData.map(todo => todo._id === id ? response.data : todo));
                if (newTitle !== null || newDescription !== null) {
                    setEditingTodo(null); // Reset the editing state
                    setEditedTitle(''); // Reset the edited title state
                    setEditedDescription(''); // Reset the edited description state
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <div className={Styles.ancestorContainer}>
            <div className={Styles.headerContainer}>
                <h1>Tasks</h1>
                <span>
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Todo'
                        placeholder='Enter task title'
                        value={newTodo}
                        onChange={(event) => {
                            setNewTodo(event.target.value);
                        }}
                    />
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Description'
                        placeholder='Enter task description'
                        value={newDescription}
                        onChange={(event) => {
                            setNewDescription(event.target.value);
                        }}
                    />
                    <button
                        id='addButton'
                        name='add'
                        className={Styles.addButton}
                        onClick={() => {
                            addTodo();
                        }}
                    >
                        + New Todo
                    </button>
                </span>
            </div>
            <div id='todoContainer' className={Styles.todoContainer}>
                {loading ? (
                    <p style={{ color: 'white' }}>Loading...</p>
                ) : (
                    todoData.length > 0 ? (
                        todoData.map((entry, index) => (
                            <div key={entry._id} className={Styles.todo}>
                                {editingTodo === entry._id ? (
                                    <div className={Styles.editContainer}>
                                        <div className={Styles.editInputs}>
                                            <input
                                                type='text'
                                                value={editedTitle}
                                                placeholder='Edit task title'
                                                onChange={(event) => setEditedTitle(event.target.value)}
                                            />
                                            <input
                                                type='text'
                                                value={editedDescription}
                                                placeholder='Edit task description'
                                                onChange={(event) => setEditedDescription(event.target.value)}
                                            />
                                        </div>
                                        <div className={Styles.editActions}>
                                            <button className={`${Styles.editButton}`} onClick={() => updateTodo(entry._id, editedTitle, editedDescription)}>Save</button>
                                            <button className={`${Styles.deleteButton}`} onClick={() => {
                                                setEditingTodo(null);
                                                setEditedTitle('');
                                                setEditedDescription('');
                                            }}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <span className={Styles.infoContainer}>
                                            <input
                                                type='checkbox'
                                                checked={entry.done}
                                                onChange={() => {
                                                    updateTodo(entry._id);
                                                }}
                                            />
                                            <div>
                                                <strong>{entry.title}</strong>
                                                <p>{entry.description}</p>
                                            </div>
                                        </span>
                                        <span className={Styles.actionsContainer}>
                                            <button className={`${Styles.editButton}`} onClick={() => {
                                                setEditingTodo(entry._id);
                                                setEditedTitle(entry.title);
                                                setEditedDescription(entry.description);
                                            }}>Edit</button>
                                            <span
                                                className={`${Styles.deleteButton}`}
                                                onClick={() => {
                                                    deleteTodo(entry._id);
                                                }}
                                            >
                                                Delete
                                            </span>
                                        </span>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className={Styles.noTodoMessage}>No tasks available. Please add a new task.</p>
                    )
                )}
            </div>
        </div>
    );
}
