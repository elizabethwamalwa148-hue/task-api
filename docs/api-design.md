| Method | Path         | Body                       | Success | Errors   |
| ------ | ------------ | -------------------------- | ------- | -------- |
| GET    | `/health`    | none                       | 200     | none     |
| GET    | `/tasks`     | none                       | 200     | none     |
| GET    | `/tasks/:id` | none                       | 200     | 404      |
| POST   | `/tasks`     | `{ "title" }`              | 201     | 400      |
| PUT    | `/tasks/:id` | `{ "title", "done" }`      | 200     | 400, 404 |
| PATCH  | `/tasks/:id` | any of `title`, `done`     | 200     | 400, 404 |
| DELETE | `/tasks/:id` | none                       | 204     | 404      |