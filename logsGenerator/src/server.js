'use strict'

const app = new (require('koa'))
const router = new (require('koa-router'))

const logsGenerator = require('./logsGenerator')

const port = process.env.PORT || 80

router.get('/start', ctx => ctx.body = logsGenerator.start())
router.get('/stop', ctx => ctx.body = logsGenerator.stop())

app.use(router.routes())
app.use(ctx => ctx.throw(400, 'Invalid url or method'))
app.listen(port, () => {
  logsGenerator.init(process.env.LOGS_PREFIX)
  console.log(`logs generator started on port "${port}"`)
})