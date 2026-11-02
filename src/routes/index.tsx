import { createFileRoute, Link} from "@tanstack/react-router"
import { getServices } from '../lib/services'

export const Route = createFileRoute("/")({ 
  loader: async () => {
    const services = getServices()
    return services
  },
  component: Home

})

function Home() {

  const services = Route.useLoaderData()

  return (
    <main className="p-6">
      <h1 className="text-3xl">Services Offered</h1>
      <div className='flex flex-wrap gap-2'>
        {services.map((service) => (
          <Link
            key={service.id}
            to='/services/$serviceId'
            params={{ serviceId: service.id}}>
            <section className='flex flex-col gap-4 border rounded-lg border-gray-500 px-4 w-100 h-50'>
            <p className='flex justify-center text-xl text-gray-800'>{service.name}</p>
            <p className='text-lg'>{service.description}</p>
            <p className='flex justify-end mt-auto'>{new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(service.unitPriceCents /100)}/{service.unit}</p>
          </section>
          </Link>
        ))}
      </div>
    </main>
  )
}
