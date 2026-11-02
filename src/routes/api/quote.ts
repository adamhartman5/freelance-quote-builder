import { createFileRoute } from '@tanstack/react-router'
import serviceData from '../../../data/services.json'

type QuoteRequest = {
  serviceId: string
  quantity: number
}

type QuoteItem = {
  name: string,
  quantity: number
  unitPriceCents: number
  lineTotalCents: number
}

export const Route = createFileRoute('/api/quote')({
  server: {
    handlers: {
      POST: async ({request}) => {
        const body = await request.json()
        if (!body)
        {
          throw new Error('Please submit a valid quote')
        }
        if (!body.items || !Array.isArray(body.items)){
          throw new Error('Quote must be submitted as an array')
        }
        const quote = body.items.map( (item: QuoteRequest) => {
          if (!item.serviceId || typeof item.serviceId !== 'string' || item.serviceId.trim() === '')
          {
            throw new Error('Please submit a valid service')
          }
          if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0 ){
            throw new Error('Please submit quantity as a number')
          }

          const service = serviceData.find((service) => item.serviceId === service.id)
          if (!service){
            throw new Error('Service not found')
          }
          return {name: service.name, quantity: item.quantity, unitPriceCents: service.unitPriceCents, lineTotalCents: service.unitPriceCents * item.quantity }
        })

        const totalCents = quote.reduce(
          (sum: number, item: QuoteItem) => sum + item.lineTotalCents, 0
        )

        return Response.json({items: quote, totalCents, currency: 'USD'})
      }
    }
  }
})