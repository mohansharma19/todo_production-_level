
import React, { useEffect, useState } from 'react'
import Create from './Create'
import '../App.css'
import axios from 'axios'
import { jsPDF } from 'jspdf'

import {
    BsCircleFill,
    BsFillCheckCircleFill,
    BsFillTrashFill,
    BsPencilSquare,
    BsSearch,
    BsPrinterFill,
    BsFilePdf,
    BsEye,
    BsX
} from 'react-icons/bs'

const Home = () => {

    const [todos, setTodos] = useState([])
    const [editId, setEditId] = useState(null)
    const [editTask, setEditTask] = useState('')
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    // PDF Preview
    const [pdfUrl, setPdfUrl] = useState(null)
    const [showPreview, setShowPreview] = useState(false)

    useEffect(() => {
        fetchTodos()
    }, [])

    // PDF URL cleanup
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl)
            }
        }
    }, [pdfUrl])

    // Fetch Todos
    const fetchTodos = () => {
        axios.get('http://localhost:3000/get')
            .then(result => setTodos(result.data))
            .catch(err => console.log(err))
    }

    // Complete Todo
    const handleComplete = (id) => {
        axios.put(`http://localhost:3000/update/${id}`)
            .then(result => {
                setTodos(prev =>
                    prev.map(todo =>
                        todo._id === id ? result.data : todo
                    )
                )
            })
            .catch(err => console.log(err))
    }

    // Delete Todo
    const handleDelete = (id) => {
        axios.delete(`http://localhost:3000/delete/${id}`)
            .then(() => {
                setTodos(prev =>
                    prev.filter(todo => todo._id !== id)
                )
            })
            .catch(err => console.log(err))
    }

    // Edit Todo
    const handleEdit = (todo) => {
        setEditId(todo._id)
        setEditTask(todo.task)
    }

    // Save Todo
    const handleSave = (id) => {
        if (!editTask.trim()) return

        axios.put(`http://localhost:3000/edit/${id}`, {
            task: editTask.trim()
        })
        .then(result => {
            setTodos(prev =>
                prev.map(todo =>
                    todo._id === id ? result.data : todo
                )
            )

            setEditId(null)
            setEditTask('')
        })
        .catch(err => console.log(err))
    }

    // Search + Filter
    const filteredTodos = todos.filter(todo => {

        const matchesSearch = todo.task
            .toLowerCase()
            .includes(search.toLowerCase())

        const matchesFilter =
            filter === 'all' ||
            (filter === 'completed' && todo.done) ||
            (filter === 'pending' && !todo.done)

        return matchesSearch && matchesFilter
    })

    // Statistics
    const completedCount = todos.filter(todo => todo.done).length
    const pendingCount = todos.length - completedCount

    // Pagination Logic
    const totalPages = Math.ceil(
        filteredTodos.length / itemsPerPage
    )

    const startIndex = (currentPage - 1) * itemsPerPage

    const currentTodos = filteredTodos.slice(
        startIndex,
        startIndex + itemsPerPage
    )

    // Reset page when search or filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [search, filter])

    // Keep page valid after deleting tasks
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages)
        }
    }, [currentPage, totalPages])

    // Generate PDF
    const generatePDF = () => {

        const doc = new jsPDF()

        const completedTodos = todos.filter(todo => todo.done)
        const pendingTodos = todos.filter(todo => !todo.done)

        let y = 20

        doc.setFontSize(22)
        doc.text('My Todo List', 20, y)

        y += 12

        doc.setFontSize(11)
        doc.text(
            `Date: ${new Date().toLocaleDateString()}`,
            20,
            y
        )

        y += 10

        doc.text(`Total Tasks: ${todos.length}`, 20, y)
        doc.text(`Completed: ${completedCount}`, 90, y)
        doc.text(`Pending: ${pendingCount}`, 150, y)

        const addSection = (title, tasks) => {

            if (y > 260) {
                doc.addPage()
                y = 20
            }

            y += 12

            doc.setFontSize(16)
            doc.text(title, 20, y)

            y += 10

            doc.setFontSize(11)

            if (tasks.length === 0) {
                doc.text('No tasks available.', 25, y)
                y += 10
                return
            }

            tasks.forEach((todo, index) => {

                const lines = doc.splitTextToSize(
                    `${index + 1}. ${todo.task}`,
                    170
                )

                if (y + lines.length * 7 > 280) {
                    doc.addPage()
                    y = 20
                }

                doc.text(lines, 25, y)
                y += lines.length * 7 + 3
            })
        }

        addSection('Pending Tasks', pendingTodos)
        addSection('Completed Tasks', completedTodos)

        return doc
    }

    // Download PDF
    const handleDownloadPDF = () => {

        if (todos.length === 0) {
            alert('No todos available!')
            return
        }

        const doc = generatePDF()
        doc.save('My-Todo-List.pdf')
    }

    // Preview PDF
    const handlePreviewPDF = () => {

        if (todos.length === 0) {
            alert('No todos available!')
            return
        }

        const doc = generatePDF()
        const blob = doc.output('blob')

        const url = URL.createObjectURL(blob)

        setPdfUrl(url)
        setShowPreview(true)
    }

    // Print List
    const handlePrint = () => {

        if (todos.length === 0) {
            alert('No todos available!')
            return
        }

        window.print()
    }

    return (
        <div className="home">

            <h2>Todo List</h2>

            <Create setTodos={setTodos} />

            {/* Statistics */}
            <div className="stats">
                <div>Total: {todos.length}</div>
                <div>Completed: {completedCount}</div>
                <div>Pending: {pendingCount}</div>
            </div>

            {/* Search */}
            <div className="search-box">
                <BsSearch />

                <input
                    type="text"
                    placeholder="Search your task..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="filters">

                <button
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>

                <button
                    className={filter === 'pending' ? 'active' : ''}
                    onClick={() => setFilter('pending')}
                >
                    Pending
                </button>

                <button
                    className={filter === 'completed' ? 'active' : ''}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </button>

            </div>

            {/* Print / PDF / View */}
            <div className="pdf-actions">

                <button onClick={handlePrint}>
                    <BsPrinterFill /> Print List
                </button>

                <button onClick={handleDownloadPDF}>
                    <BsFilePdf /> Download PDF
                </button>

                <button onClick={handlePreviewPDF}>
                    <BsEye /> View PDF
                </button>

            </div>

            {/* Todo List */}
            {currentTodos.length === 0 ? (

                <div className="empty-state">
                    <h3>No Tasks Found!</h3>
                    <p>Add a new task or change your search.</p>
                </div>

            ) : (

                currentTodos.map(todo => (

                    <div className="task" key={todo._id}>

                        <div className="checkbox">

                            {todo.done ? (

                                <BsFillCheckCircleFill
                                    className="icon completed"
                                    onClick={() => handleComplete(todo._id)}
                                />

                            ) : (

                                <BsCircleFill
                                    className="icon"
                                    onClick={() => handleComplete(todo._id)}
                                />

                            )}

                            {editId === todo._id ? (

                                <input
                                    type="text"
                                    value={editTask}
                                    onChange={(e) => setEditTask(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSave(todo._id)
                                        }

                                        if (e.key === 'Escape') {
                                            setEditId(null)
                                            setEditTask('')
                                        }
                                    }}
                                />

                            ) : (

                                <p className={todo.done ? 'done' : ''}>
                                    {todo.task}
                                </p>

                            )}

                        </div>

                        <div className="task-actions">

                            {editId === todo._id ? (

                                <>
                                    <button onClick={() => handleSave(todo._id)}>
                                        Save
                                    </button>

                                    <button onClick={() => {
                                        setEditId(null)
                                        setEditTask('')
                                    }}>
                                        Cancel
                                    </button>
                                </>

                            ) : (

                                <>
                                    <BsPencilSquare
                                        className="icon"
                                        onClick={() => handleEdit(todo)}
                                    />

                                    <BsFillTrashFill
                                        className="icon delete"
                                        onClick={() => handleDelete(todo._id)}
                                    />
                                </>

                            )}

                        </div>

                    </div>

                ))

            )}

            {/* Pagination */}
            {filteredTodos.length > 0 && (

                <div className="pagination">

                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        Previous
                    </button>

                    {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1
                    ).map(page => (

                        <button
                            key={page}
                            className={currentPage === page ? 'active' : ''}
                            onClick={() => setCurrentPage(page)}
                        >
                            {page}
                        </button>

                    ))}

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>

                </div>

            )}

            {/* Printable List */}
            <div id="printable-todo" className="print-area">

                <h1>My Todo List</h1>

                <p>Date: {new Date().toLocaleDateString()}</p>

                <h3>Pending Tasks ({pendingCount})</h3>

                {todos.filter(todo => !todo.done).map((todo, index) => (
                    <p key={todo._id}>
                        {index + 1}. {todo.task}
                    </p>
                ))}

                <h3>Completed Tasks ({completedCount})</h3>

                {todos.filter(todo => todo.done).map((todo, index) => (
                    <p key={todo._id}>
                        {index + 1}. {todo.task}
                    </p>
                ))}

            </div>

            {/* PDF Preview Modal */}
            {showPreview && pdfUrl && (

                <div className="pdf-modal">

                    <div className="pdf-modal-content">

                        <div className="pdf-modal-header">

                            <h3>PDF Preview</h3>

                            <button onClick={() => setShowPreview(false)}>
                                <BsX />
                            </button>

                        </div>

                        <iframe
                            src={pdfUrl}
                            title="Todo PDF Preview"
                            className="pdf-frame"
                        />

                        <button
                            className="preview-download"
                            onClick={handleDownloadPDF}
                        >
                            <BsFilePdf /> Download PDF
                        </button>

                    </div>

                </div>

            )}

        </div>
    )
}

export default Home
