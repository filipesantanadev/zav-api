import { app } from './app.js'
import { env } from './env/index.js'

app
  .listen({
    host: '0.0.0.0',
    port: env.PORT,
  })
  .then(() => {
    app.log.info('HTTP Server Running!')
  })
