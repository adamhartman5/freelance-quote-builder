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

type SelectedService = {
  service: Service
  quantity: number
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
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  

  function addToCart(service: Service) {
    const selectedService = selectedServices.find(
      (selectedService) => selectedService.service.id === service.id
    )
    if (!selectedService) {
      setSelectedServices((prev) => [...prev, {service: service, quantity: 1}])
    }
  }

  function removeFromCart(service: Service) {
    const selectedService = selectedServices.find(
      (selectedService) => selectedService.service.id === service.id
    )
    if (selectedService) {
      setSelectedServices((prev) =>
        prev.filter((service) => service.service.id !== selectedService.service.id)
      )
    }
  }

  function changeQuantity(service: Service, quantity: number){
    const selectedService = selectedServices.find((selectedService) => selectedService.service.id === service.id)
    if(!Number.isInteger(quantity) || quantity < 1 || quantity > 20)
      return
    if(selectedService){
      setSelectedServices((prev) => prev.map((entry) => entry.service.id === service.id ? {...entry, quantity: quantity} : entry))
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-3xl mb-6">Services Offered</h1>
      <div className="flex flex-wrap gap-2">
        {services.map((service) => (
          <div key={service.id} className="flex gap-3">
            <Link
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
                (selectedService) => service.id === selectedService.service.id
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
        <div className="mt-2 w-80 px-2">
          {selectedServices.length === 0 ? (
            <p>No services selected</p>
          ) : (
            selectedServices.map((selectedService) => {
              const inputId = `quantity-${selectedService.service.id}`
              return (
                <div key={selectedService.service.id} className='flex gap-2 pb-2 justify-between'>
                  <p>{selectedService.service.name}</p>
                  <div className='flex gap-2'>
                    <label htmlFor="{inputId}">Qty</label>
                    <input
                      className='flex text-center border border-black rounded-sm w-12 pl-2' 
                      id={inputId}
                      type='number'
                      min={1}
                      max={20}
                      step={1}
                      value={selectedService.quantity}
                      onChange={(event) => changeQuantity(selectedService.service, event.currentTarget.valueAsNumber)}  
                    />
                  </div>
                </div>
            )})
          )}
        </div>
      </section>
    </main>
  )
}
