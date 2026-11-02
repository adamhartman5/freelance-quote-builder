import { createFileRoute } from '@tanstack/react-router'
import serviceData from '../../../data/services.json'

type Quote = {
  items: QuoteRequest[]
}

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
        try{
          function isRecord(value: unknown) : value is Record<string, unknown>{
              return typeof value === 'object' && value !== null && !Array.isArray(value)
          }
          const body = await request.json()

          if (!isRecord(body) || !body.items || !Array.isArray(body.items)){
            return Response.json({error: 'Quote must be submitted as an object with an items array'}, {status: 400})
          }
          if (body.items.length === 0){
            return Response.json({error: 'Please submit a valid quote'}, {status: 400})
          }
          if (body.items.length > 10){
            return Response.json({error: 'There is a max of 10 services allowed'}, {status: 400})
          }

          const items: unknown[] = body.items
          const quote: QuoteItem[] = []
          const seenServiceIds = new Set<string>()

          for (const item of items){
            if (!isRecord(item)) {
              return Response.json({ error: 'Each item must be an object' }, { status: 400 })
            }

            const serviceId = item.serviceId
            const quoteQuantity = item.quantity

            if (!serviceId || typeof serviceId !== 'string' || serviceId.trim() === '')
            {
              return Response.json({error: 'Please submit a valid service'}, {status: 400})
            }
            if (typeof quoteQuantity !== 'number'|| !Number.isInteger(quoteQuantity) || quoteQuantity <= 0 || quoteQuantity > 20){
              return Response.json({error: 'Quantity must be a number between 1 and 20'}, {status: 400})
            }

            const service = serviceData.find((service) => serviceId.trim() === service.id)
            if (!service){
              return Response.json({error: 'Service not found'}, {status: 400})
            }
            if (seenServiceIds.has(service.id)){
              return Response.json({error: 'Duplicate services are not allowed'}, {status: 400})
            }

            seenServiceIds.add(service.id)

            quote.push({
              name: service.name,
              quantity: quoteQuantity,
              unitPriceCents: service.unitPriceCents,
              lineTotalCents: service.unitPriceCents * quoteQuantity
            })
          }

          const totalCents = quote.reduce(
            (sum: number, item: QuoteItem) => sum + item.lineTotalCents, 0
          )

          return Response.json({items: quote, totalCents, currency: 'USD'})
        } catch (error){
          if (error instanceof Error){
            return Response.json({ error: `An error occurred while processing the request: ${error.message}`}, {status: 400})
          }
          return Response.json({ error: 'An error occurred while processing the request'}, {status: 400})
        }
      }
    }
  }
})