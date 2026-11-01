const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()

const cors = require('cors')
const TodoModel = require('./Models/Todo')

const app = express()

app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err))


// GET Todo API
app.get('/get', async (req, res) => {
    try {
        const result = await TodoModel.find().sort({ createdAt: -1 })
        res.status(200).json(result)

    } catch (err) {
        console.log('GET ERROR:', err)
        res.status(500).json({ message: err.message })
    }
})


// ADD Todo API
app.post('/add', async (req, res) => {
    try {
        const { task } = req.body

        if (!task || !task.trim()) {
            return res.status(400).json({
                message: 'Task is required'
            })
        }

        const result = await TodoModel.create({
            task: task.trim()
        })

        res.status(201).json(result)

    } catch (err) {
        console.log('ADD ERROR:', err)
        res.status(500).json({ message: err.message })
    }
})


// COMPLETE / INCOMPLETE Todo API  {ye maine add kari h new }
app.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params

        const todo = await TodoModel.findById(id)

        if (!todo) {
            return res.status(404).json({
                message: 'Todo not found'
            })
        }

        const result = await TodoModel.findByIdAndUpdate(
            id,
            { done: !todo.done },
            { returnDocument: 'after' }
        )

        res.json(result)

    } catch (err) {
        console.log('UPDATE ERROR:', err)
        res.status(500).json({ message: err.message })
    }
})


// DELETE Todo API 
app.delete('/delete/:id', async (req, res) => {
    try {
        const result = await TodoModel.findByIdAndDelete(req.params.id)

        if (!result) {
            return res.status(404).json({
                message: 'Todo not found'
            })
        }

        res.json({
            message: 'Todo deleted successfully',
            result
        })

    } catch (err) {
        console.log('DELETE ERROR:', err)
        res.status(500).json({ message: err.message })
    }
})


// EDIT Todo API {ye new add kari h maine  }
app.put('/edit/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { task } = req.body

        if (!task || !task.trim()) {
            return res.status(400).json({
                message: 'Task cannot be empty'
            })
        }

        const result = await TodoModel.findByIdAndUpdate(
            id,
            { task: task.trim() },
            {
                returnDocument: 'after',
                runValidators: true
            }
        )

        if (!result) {
            return res.status(404).json({
                message: 'Todo not found'
            })
        }

        res.json(result)

    } catch (err) {
        console.log('EDIT ERROR:', err)
        res.status(500).json({ message: err.message })
    }
})


// Server
const PORT = process.env.PORT || 3000

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`)
})