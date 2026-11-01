import React, { useState } from 'react'
import "../App.css"
import axios from 'axios'

const Create = ({ setTodos }) => {
    const [task, setTask] = useState('')

    const handleAdd = () => {
        if (!task.trim()) return

        axios.post('http://localhost:3000/add', {
            task: task.trim()
        })
        .then(result => {
            setTodos(prev => [...prev, result.data])
            setTask('')
        })
        .catch(err => {
            console.log(err.response?.data || err.message)
        })
    }

    return (
        <div className='create_form'>
            <input
                type='text'
                placeholder='Enter Task'
                value={task}
                onChange={(e) => setTask(e.target.value)}
            />

            <button type="button" onClick={handleAdd}>
                Add
            </button>
        </div>
    )
}

export default Create