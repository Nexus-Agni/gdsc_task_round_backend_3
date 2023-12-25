const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/todo_GDSC');
app.use(express.json());
const schema = mongoose.model('todo', {
    id : Number,
    title : String,
    description : String,
    completed : Boolean
});

// Middleware to check if todo is present
async function isTodoPresentMiddleware(req, res, next) {
    const todo = await schema.findOne({ id: req.params.id });
    if (todo) {
        next();
    } else {
        res.send("Todo not found").status(404);
    }
}

//Middleware before creating a todo
async function isTodoPresentMiddlewareBeforeCreate(req, res, next) {
    const todo = await schema.findOne({ id: req.body.id });
    if (todo) {
        res.send("Todo already present with given id").status(400);
    } else {
        next();
    }
};

// Get all todos
app.get('/todo', async (req, res) => {
    try {
        const todos = await schema.find({});
        res.json(todos).status(200);
    } catch (error) {
        res.send("Server Error").status(500);
    }
});

// Get a todo by id
app.get('/todo/:id',isTodoPresentMiddleware, async (req, res) => {
    try {
        const todo = await schema.findOne({ id: req.params.id });
        res.json(todo).status(200);
    } catch (error) {
        res.send("Server Error").status(500);
        console.log(error);
    }
});

// Update a todo by id
app.put('/todo/:id',isTodoPresentMiddleware, async (req, res) => {
    const { title, description, completed } = req.body;
    try {
        const todo = await schema.findOne({ id: req.params.id });
        if (title) {
            todo.title = title;
        }
        if (description) {
            todo.description = description;
        }
        if (completed) {
            todo.completed = completed;
        }
        todo.save();
        res.json(todo).status(200);
    } catch (error) {
        res.send("Server Error").status(500);
        console.log(error);
    }
});

// Create a todo
app.post('/todo/',isTodoPresentMiddlewareBeforeCreate, async (req, res) => {
    try {
        const { id ,title, description, completed } = req.body;
        const todo = new schema({
            id : id,
            title : title,
            description : description,
            completed : completed
        });
        todo.save();
        res.json({
            title : title,
            description : description,
            completed : completed
        }).status(200);
    } catch (err) {
        res.send("Server Error").status(500);
    }
});

// Delete a todo by id
app.delete('/todo/:id',isTodoPresentMiddleware, async (req, res) => {
    try {
        const todo = await schema.findOneAndDelete({ id: req.params.id });
        if (todo) {
            res.status(200).send("Todo removed");
        } else {
            res.status(404).send("Todo not found");
        }
    } catch (err) {
        console.log(err);
        res.send("Server Error").status(500);
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});