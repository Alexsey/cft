'use strict'

const router = new (require('koa-router'))

router.use('/start', require('./start').routes())
router.use('/stop', require('./stop').routes())
router.use('/logs', require('./logs').routes())

module.exports = router