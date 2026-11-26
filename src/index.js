import express from 'express'

const app = express()
app.use(express.json())

const tasks = []
let nextId = 1

// NEW: helpers so the same checks aren't repeated in every route
const isValidTitle = (value) => typeof value === 'string' && value.trim() !== ''
const findTask = (id) => tasks.find((t) => t.id === Number(id))

app.get('/', (req, res) => {
  res.send('Task API is running!')
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.post('/tasks', (req, res) => {
  const { title, done = false } = req.body ?? {}

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'title is required' })
  }
  if (typeof done !== 'boolean') {
    return res.status(400).json({ error: 'done must be a boolean' })
  }

  const task = { id: nextId++, title: title.trim(), done }
  tasks.push(task)

  res.status(201).location(`/tasks/${task.id}`).json(task)
})

app.get('/tasks', (req, res) => {
  let result = tasks
  if (req.query.done !== undefined) {
    result = result.filter((t) => String(t.done) === req.query.done)
  }

  if (typeof req.query.q === 'string' && req.query.q.trim() !== '') {
    const needle = req.query.q.trim().toLowerCase()
    result = result.filter((t) => t.title.toLowerCase().includes(needle))
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
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' })
  }
  next(err)
})

const port = process.env.PORT ?? 3000
app.listen(port, () => console.log(`Listening on ${port}`))