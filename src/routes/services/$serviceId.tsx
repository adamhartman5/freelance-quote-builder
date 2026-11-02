import { createFileRoute, notFound } from "@tanstack/react-router"
import { getService } from '../../lib/services'

export const Route = createFileRoute('/services/$serviceId')({
  loader: async({params}) => {
    const service = await getService({ data: params.serviceId})
    if (service === null)
    {
      throw notFound()
    }
    return service
  },
  notFoundComponent: () => {
    return (
      <main>
        <h1>Service not found</h1>
        <p>A service with that id was not found</p>
      </main>
    )
  },
  component: Service
})

function Service() {

  const service = Route.useLoaderData()

  return (
    <main>
      <h1>{service.name}</h1>
      <p>{service.description}</p>
      <p>{new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(service.unitPriceCents /100)}/{service.unit}</p>
    </main>
  )
}