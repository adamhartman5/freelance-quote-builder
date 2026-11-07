import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router"
import { getService } from "../../lib/services"
import { centsToDollars } from "../../utilities/utils"

export const Route = createFileRoute("/services/$serviceId")({
  loader: async ({ params }) => {
    const service = await getService({ data: params.serviceId })
    if (service === null) {
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
  component: Service,
})

function Service() {
  const service = Route.useLoaderData()
  const navigate = useNavigate()

  return (
    <div className="bg-theme-cream px-4 sm:px-6 lg:px-8">
      <main>
        <div className="flex flex-wrap gap-8 items-end justify-start my-10 py-10">
          <div className="flex flex-col justify-end h-full max-h-fit max-w-160">
            <h1 className="text-amber-700 font-bold uppercase text-sm pb-4">
              goodwork service
            </h1>
            <h2 className="text-theme-dark-green font-bold text-3xl lg:text-6xl pb-4">
              {service.name}
            </h2>
            <p className="text-theme-dark-green text-xl font-stretch-semi-expanded pt-4">
              {service.description}
            </p>
          </div>
          <div className="flex flex-col gap-8 border border-theme-light-green bg-theme-off-white rounded-2xl justify-between items-start max-w-120 max-h-fit w-full h-fit">
            <div className="m-6">
              <p className="uppercase font-stretch-semi-expanded font-sm text-theme-dark-green font-semibold">
                starting rate
              </p>
              <p className="text-3xl lg:text-5xl font-bold text-theme-dark-green py-2">{`$${service.unitPriceCents / 100}`}</p>
              <p className="text-theme-dark-green">per {service.unit}</p>
            </div>
            <div className="flex flex-col items-start border-t border-theme-light-green m-6 py-2">
              <p className="py-6 text-theme-dark-green text-sm">
                {service.pageDescription}
              </p>
              <button className="bg-theme-dark-green text-white p-3 text-sm font-semibold rounded-4xl" onClick={() => navigate({ to:'/', hash: 'estimate'})}>
                Estimate this service
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
