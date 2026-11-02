import { createFileRoute, Link } from "@tanstack/react-router"
import { useState } from "react"
import { getServices } from "../lib/services"

type Service = {
  id: string
  name: string
  description: string
  unit: string
  unitPriceCents: number
}

export const Route = createFileRoute("/")({
  loader: async () => {
    const services = getServices()
    return services
  },
  component: Home,
})

function Home() {
  const services = Route.useLoaderData()
  const [selectedServices, setSelectedServices] = useState<Service[]>([])

  function addToCart(service: Service) {
    const selectedService = selectedServices.find(
      (selectedService) => selectedService.id === service.id
    )
    if (!selectedService) {
      setSelectedServices((prev) => [...prev, service])
    }
  }

  function removeFromCart(service: Service) {
    const selectedService = selectedServices.find(
      (selectedService) => selectedService.id === service.id
    )
    if (selectedService) {
      setSelectedServices((prev) =>
        prev.filter((service) => service.id !== selectedService.id)
      )
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl mb-6">Services Offered</h1>
      <div className="flex flex-wrap gap-2">
        {services.map((service) => (
          <div className="flex gap-3">
            <Link
              key={service.id}
              to="/services/$serviceId"
              params={{ serviceId: service.id }}
            >
              <section className="flex flex-col gap-4 border rounded-lg border-gray-500 px-4 w-100 h-50">
                <p className="flex justify-center text-xl text-gray-800">
                  {service.name}
                </p>
                <p className="text-lg">{service.description}</p>
                <p className="flex justify-end mt-auto">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(service.unitPriceCents / 100)}
                  /{service.unit}
                </p>
              </section>
            </Link>
            <div className="flex items-center">
              {selectedServices.find(
                (selectedService) => service.id === selectedService.id
              ) ? (
                <button
                  className="flex justify-center items-center border border-black rounded-lg px-6 py-3 bg-yellow-300"
                  onClick={() => removeFromCart(service)}
                >
                  Remove
                </button>
              ) : (
                <button
                  className="flex justify-center items-center border border-black rounded-lg px-6 py-3 bg-yellow-300"
                  onClick={() => addToCart(service)}
                >
                  Add
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <section className="mt-6">
        <h1 className="text-2xl">Selected Services</h1>
        <div className="mt-2">
          {selectedServices.length === 0 ? (
            <p>No services selected</p>
          ) : (
            selectedServices.map((selectedService) => (
              <p key={selectedService.id}>{selectedService.name}</p>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
