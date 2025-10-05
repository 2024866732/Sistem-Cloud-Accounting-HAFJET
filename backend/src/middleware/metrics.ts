import { Request, Response } from 'express'
import client from 'prom-client'

// Default metrics collection
const collectDefaultMetrics = client.collectDefaultMetrics
// Use default settings; avoid passing unsupported options to keep compatibility across prom-client versions
collectDefaultMetrics()

// Example custom metric
export const notificationDeliveryCounter = new client.Counter({
  name: 'notification_delivery_total',
  help: 'Total number of notifications delivered',
  labelNames: ['status'] as string[],
})

// Expose metrics endpoint handler with simple Basic Auth using METRICS_BASIC_AUTH
export const metricsHandler = async (req: Request, res: Response) => {
  const basicAuth = process.env.METRICS_BASIC_AUTH
  const bearerToken = process.env.METRICS_BEARER_TOKEN

  if (basicAuth || bearerToken) {
    const header = req.headers.authorization
    if (!header) {
      if (basicAuth) res.setHeader('WWW-Authenticate', 'Basic realm="metrics"')
      return res.status(401).send('Unauthorized')
    }

    // Bearer token takes precedence
    if (bearerToken && header.startsWith('Bearer ')) {
      const provided = header.split(' ')[1]
      if (provided !== bearerToken) return res.status(403).send('Forbidden')
    } else if (basicAuth && header.startsWith('Basic ')) {
      const provided = Buffer.from(header.split(' ')[1], 'base64').toString('utf8')
      if (provided !== basicAuth) return res.status(403).send('Forbidden')
    } else {
      if (basicAuth) res.setHeader('WWW-Authenticate', 'Basic realm="metrics"')
      return res.status(401).send('Unauthorized')
    }
  }

  try {
    res.setHeader('Content-Type', client.register.contentType)
    const metrics = await client.register.metrics()
    res.send(metrics)
  } catch (err) {
    res.status(500).send('Error collecting metrics')
  }
}

export default client
