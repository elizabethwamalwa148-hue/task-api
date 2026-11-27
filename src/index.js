import express from 'express'

const app = express()


app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`)
  })
  next()
})

app.use(express.json())

const tasks = []
let nextId = 1


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


app.put('/tasks/:id', (req, res) => {
  const task = findTask(req.params.id)
  if (!task) {
    return res.status(404).json({ error: 'Task not found' })
  }

  const { title, done } = req.body ?? {}
  if (!isValidTitle(title) || typeof done !== 'boolean') {
    return res.status(400).json({ error: 'title and done are both required' })
  }

  task.title = title.trim()
  task.done = done
  res.json(task)
})


app.patch('/tasks/:id', (req, res) => {
  const task = findTask(req.params.id)
  if (!task) {
    return res.status(404).json({ error: 'Task not found' })
  }

  const { title, done } = req.body ?? {}
  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: 'send at least one of: title, done' })
  }
  if (title !== undefined && !isValidTitle(title)) {
    return res.status(400).json({ error: 'title must be a non-empty string' })
  }
  if (done !== undefined && typeof done !== 'boolean') {
    return res.status(400).json({ error: 'done must be a boolean' })
  }

  if (title !== undefined) task.title = title.trim()
  if (done !== undefined) task.done = done
  res.json(task)
})


app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id))
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' })
  }

  tasks.splice(index, 1)
  res.status(204).end()
})


app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' })
  }
  next(err)
})

const port = process.env.PORT ?? 3000
app.listen(port, () => console.log(`Listening on ${port}`))