'use strict'

const app = new (require('koa'))

const routes = require('./routes')

const port = process.env.PORT || 80

app.use(routes.routes())
app.use(routes.allowedMethods())
app.use(ctx => ctx.throw(400, 'Invalid url or method'))
app.listen(port, () =>
  console.log(`logger started on port "${port}"`)
)