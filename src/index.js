import express from 'express'

const app = express()
app.use(express.json())

const tasks = []
let nextId = 1

app.get('/', (req, res) => {
  res.send('Task API is running!')
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/tasks', (req, res) => {
  const title = req.body?.title

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required' })
  }

  const task = { id: nextId++, title: title.trim(), done: false }
  tasks.push(task)

  res.status(201).json(task)
})

app.get('/tasks', (req, res) => {
  let result = tasks
  if (req.query.done !== undefined) {
    result = tasks.filter((t) => String(t.done) === req.query.done)
  }
  res.set('X-Total-Count', String(result.length))
  res.json(result)
})

app.get('/tasks/:id', (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id))
  if (!task) {
    return res.status(404).json({ error: 'Task not found' })
  }
  res.json(task)
})

const port = process.env.PORT ?? 3000
app.listen(port, () => console.log(`Listening on ${port}`))