import { createFileRoute, Link } from "@tanstack/react-router"
import { useState, useRef } from "react"
import { getServices } from "../lib/services"
import { QuoteItem } from './api/quote'

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

type QuoteResponse = {
  items: QuoteItem[]
  totalCents: number
  currency: string
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
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [error, setError] = useState<string>('')
  const [status, setStatus] = useState<number>()
  const selectionRevision = useRef(0)
  

  function addToCart(service: Service) {
    setQuote(null)
    setError('')
    setStatus(undefined)

    const selectedService = selectedServices.find(
      (selectedService) => selectedService.service.id === service.id
    )
    if (!selectedService) {
      selectionRevision.current +=1
      setSelectedServices((prev) => [...prev, {service: service, quantity: 1}])
    }
  }

  function removeFromCart(service: Service) {
    setQuote(null)
    setError('')
    setStatus(undefined)
    
    const selectedService = selectedServices.find(
      (selectedService) => selectedService.service.id === service.id
    )
    if (selectedService) {
      selectionRevision.current += 1
      setSelectedServices((prev) =>
        prev.filter((service) => service.service.id !== selectedService.service.id)
      )
    }
  }

  function changeQuantity(service: Service, quantity: number){
    setQuote(null)
    setError('')
    setStatus(undefined)

    const selectedService = selectedServices.find((selectedService) => selectedService.service.id === service.id)
    if(!Number.isInteger(quantity) || quantity < 1 || quantity > 20)
      return
    if(selectedService){
      selectionRevision.current += 1
      setSelectedServices((prev) => prev.map((entry) => entry.service.id === service.id ? {...entry, quantity: quantity} : entry))
    }
  }

  async function handleQuote(selectedServices: SelectedService[]){
    const submittedRevision = selectionRevision.current
    const response = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({
        items: selectedServices.map(({service, quantity}) => ({
          serviceId: service.id,
          quantity,
        }))
      })
    })

    const result = await response.json()
    if(submittedRevision === selectionRevision.current){
      if(!response.ok){
        setStatus(response.status)
        setError(result.error)
      }
      if(response.ok){
        setQuote(result)
      }
    }

    return result
  }

  function clearQuote(){
    setSelectedServices([])
    setQuote(null)
    setStatus(undefined)
    setError('')
    selectionRevision.current += 1
  }

  function centstoDollars(price: number, currencyUnit: string){
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyUnit,
      }).format(price / 100)
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
                  {centstoDollars(service.unitPriceCents, 'USD')}
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
                      <label htmlFor={inputId}>Qty</label>
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
          <div>
            {selectedServices.length > 0 && quote === null &&
              <button 
                className='border border-black rounded-lg px-6 py-3 bg-yellow-300'
                onClick={() => handleQuote(selectedServices)}
              >
                Quote Services
              </button>
            }
          </div>
          <div>
            {error !== '' &&
              <p className='text-red-500'>An error occurred processing the request: {status} {error} </p>
            }
          </div>
        </section>
      { quote !== null &&
        <section className='mt-6 w-screen'>
            <h1 className='text-2xl'>Quoted Services</h1>
            <div className='flex w-lg justify-between'>
              <p className='w-40 text-left'>Service Name</p>
              <p className='w-20 text-left'>Unit Price</p>
              <p className='w-7 text-left'>Qty</p>
              <p className='w-30 text-left'>Line Total Price</p>
            </div>
            <div>
              {quote.items.map((lineItem) => (
                <div key={lineItem.name} className='flex justify-between w-lg'>
                  <p className='text-left w-40'>{lineItem.name}</p>
                  <p className='text-left w-20'>{centstoDollars(lineItem.unitPriceCents, quote.currency)}</p>
                  <p className='text-center w-7'>{lineItem.quantity}</p>
                  <p className='text-center w-30'>{centstoDollars(lineItem.lineTotalCents, quote.currency)} </p>
                </div>
              ))}
            </div>
            <div>
              <p>Grand Total: {centstoDollars(quote.totalCents, quote.currency)}</p>
            </div>
            <button 
              className='border border-black rounded-lg px-6 py-3 bg-yellow-300'
              onClick={()=> clearQuote()}
            >
            Clear Quote
            </button>
        </section>
      }
    </main>
  )
}
