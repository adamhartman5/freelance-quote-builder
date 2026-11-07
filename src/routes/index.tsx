import { createFileRoute, Link } from "@tanstack/react-router"
import { useState, useRef } from "react"
import { getServices } from "../lib/services"
import { QuoteItem } from "./api/quote"
import { centsToDollars } from "../utilities/utils"

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
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    []
  )
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [error, setError] = useState<string>("")
  const [status, setStatus] = useState<number>()
  const [pending, setPending] = useState<boolean>(false)
  const selectionRevision = useRef<number>(0)
  const lockQuote = useRef<boolean>(false)

  function addToCart(service: Service) {
    setQuote(null)
    setError("")
    setStatus(undefined)

    const selectedService = selectedServices.find(
      (selectedService) => selectedService.service.id === service.id
    )
    if (!selectedService) {
      selectionRevision.current += 1
      setSelectedServices((prev) => [
        ...prev,
        { service: service, quantity: 1 },
      ])
    }
  }

  function removeFromCart(service: Service) {
    setQuote(null)
    setError("")
    setStatus(undefined)

    const selectedService = selectedServices.find(
      (selectedService) => selectedService.service.id === service.id
    )
    if (selectedService) {
      selectionRevision.current += 1
      setSelectedServices((prev) =>
        prev.filter(
          (service) => service.service.id !== selectedService.service.id
        )
      )
    }
  }

  function changeQuantity(service: Service, quantity: number) {
    setQuote(null)
    setError("")
    setStatus(undefined)

    const selectedService = selectedServices.find(
      (selectedService) => selectedService.service.id === service.id
    )
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return
    if (selectedService) {
      selectionRevision.current += 1
      setSelectedServices((prev) =>
        prev.map((entry) =>
          entry.service.id === service.id
            ? { ...entry, quantity: quantity }
            : entry
        )
      )
    }
  }

  async function handleQuote(selectedServices: SelectedService[]) {
    if (lockQuote.current) return

    lockQuote.current = true
    setPending(true)
    setQuote(null)
    setError("")
    setStatus(undefined)
    const submittedRevision = selectionRevision.current
    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedServices.map(({ service, quantity }) => ({
            serviceId: service.id,
            quantity,
          })),
        }),
      })

      const result = await response.json()
      if (submittedRevision === selectionRevision.current) {
        if (!response.ok) {
          if (
            response.status &&
            result.error &&
            typeof result.error === "string"
          ) {
            setStatus(response.status)
            if (response.status === 400) {
              setError(
                `${result.error}. Please correct the selection and try again`
              )
            } else {
              setError(`${result.error}. Please retry the request`)
            }
          } else {
            setError("An unknown error occurred, please retry the request")
          }
        }
        if (response.ok) {
          setQuote(result)
        }
      }

      return result
    } catch (error) {
      if (submittedRevision === selectionRevision.current) {
        if (error instanceof Error) {
          console.log(error.message)
        }
        setError("An unknown error occurred, please retry the request")
      }
    } finally {
      lockQuote.current = false
      setPending(false)
    }
  }

  return (
    <div className="font-roboto">
      <main className="flex flex-col justify-center">
        <section className="w-full ">
          <div className="relative mx-auto w-full max-w-[144rem] max-h-fit px-4 sm:px-6 lg:px-10 xl:px-15 2xl:px-25 py-15 my-2">
            <div className="">
              <h1 className="text-md font-bold tracking-widest text-amber-800 uppercase">
                Service Menu
              </h1>
              <div className="flex justify-between items-end flex-wrap py-4">
                <h2 className="text-emerald-800 text-3xl tracking-tight font-bold font-sans">
                  Start where you need us.
                </h2>
                <p className="text-emerald-800 font-medium font-sans">
                  Straightforward scope. Clear pricing.
                </p>
              </div>
              <div className="gap-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ">
                {services.map((service, index) => (
                  <div key={service.id} className="flex">
                    <section className="flex flex-col grow gap-4 border rounded-3xl border-gray-100 p-7 max-w-100 max-h-95 bg-theme-1">
                      <div className="flex justify-between pb-5 pt-2">
                        <p className="text-sm text-amber-800 font-extrabold">
                          {String(index + 1).padStart(2, "0")}
                        </p>
                        <p className="text-emerald-800 font-extrabold tracking-widest px-3 py-1 uppercase text-xs rounded-4xl bg-theme-3">
                          per {service.unit}
                        </p>
                      </div>
                      <p className="flex text-left text-2xl font-bold text-emerald-800">
                        {service.name}
                      </p>
                      <p className="text-md text-gray-800 h-full">
                        {service.description}
                      </p>
                      <hr className="border-t-gray-200" />
                      <div className="flex justify-between items-end py-4">
                        <p className="text-3xl font-extrabold text-emerald-800">
                          ${service.unitPriceCents / 100}
                        </p>
                        <p className="text-sm text-gray-800">/{service.unit}</p>
                      </div>
                      <div className="pb-2">
                        <Link
                          to="/services/$serviceId"
                          params={{ serviceId: service.id }}
                          className=" flex items-start gap-2 text-sm font-extrabold text-emerald-800"
                        >
                          <p className='underline underline-offset-4 decoration-2 decoration-amber-600'>Explore service</p>
                          <span className='underline underline-offset-4 decoration-2 decoration-amber-600' aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </section>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-theme-dark-green text-white" id='estimate'>
          <div className="relative mx-auto px-4 sm:px-6 lg:px-10 xl:px-15 2xl:px-25 py-15 max-w-[144rem]">
            <div className="flex flex-wrap gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 max-w-2xl">
                  <h1 className="text-md uppercase font-semibold font-stretch-semi-expanded">
                    Plan your engagement
                  </h1>
                  <h2 className="text-4xl font-bold">
                    Build a quick estimate.
                  </h2>
                  <p className="text-md">
                    Choose the support you need and set a quantity. Your
                    estimate is calculated from our current service menu.
                  </p>
                </div>
                <div className="flex flex-col">
                  {services.map((service) => {
                    const checkboxId = `select-${service.id}`
                    const quantityId = `quantity-${service.id}`
                    const isSelected = selectedServices.some(
                      (selectedService) =>
                        selectedService.service.id === service.id
                    )
                    return (
                      <div key={service.id} className="flex flex-wrap justify-between gap-3 border border-none m-2 rounded-2xl p-4 bg-theme-muted-green">
                        <div className="flex flex-wrap gap-3">
                          <div>
                            <input
                              type="checkbox"
                              className="accent-amber-600"
                              id={checkboxId}
                              onClick={() =>
                                isSelected
                                  ? removeFromCart(service)
                                  : addToCart(service)
                              }
                            />
                          </div>
                          <div className="flex flex-col">
                            <label htmlFor={checkboxId} className='font-bold'>{service.name}</label>
                            <p className="text-sm text-neutral-200">
                              ${service.unitPriceCents / 100} per {service.unit}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 max-w-fit items-center">
                          <label htmlFor={quantityId}>Quantity</label>
                          <input
                            type="number"
                            id={quantityId}
                            className="flex text-center bg-white text-black rounded-sm max-w-12 pl-2 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                            min={1}
                            max={20}
                            step={1}
                            disabled={!isSelected}
                            value={
                              selectedServices.find(
                                (selectedService) =>
                                  selectedService.service.id === service.id
                              )?.quantity ?? 1
                            }
                            onChange={(event) =>
                              changeQuantity(
                                service,
                                event.currentTarget.valueAsNumber
                              )
                            }
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="">
                  {selectedServices.length > 0 && quote === null ? (
                    <button
                      className="bg-amber-700 text-black font-bold rounded-4xl py-4 px-6 disabled:bg-gray-500 disabled:bg-gray-200"
                      onClick={() => handleQuote(selectedServices)}
                      disabled={pending ? true : undefined}
                    >
                      {pending ? "Getting Estimate..." : "Request Estimate"}
                    </button>
                  ) : (
                    <button
                      className="bg-gray-500 text-gray-200 font-bold rounded-4xl py-4 px-6"
                      disabled={true}
                    >
                      Request Estimate
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4 border border-blue-500 w-full max-w-110 h-fit border border-black rounded-3xl lg:ml-5 bg-white">
                {error === "" ? (
                  <div className="flex flex-col gap-3 px-3 py-4">
                    <div className='text-amber-800 uppercase text-sm tracking-widest font-extrabold'>
                      <p>Your Estimate</p>
                    </div>
                    {quote === null ? (
                      <p className="text-emerald-800 text-2xl font-extrabold">Your itemized estimate will appear here</p>
                    ) : (
                      <div>
                        <div className='pb-6'>
                          <p className="text-emerald-800 text-2xl font-extrabold">Your itemized estimate</p>
                        </div>
                          {quote.items.map((item, index) => (
                            <div className='' key={item.name}>
                              {index >= 1 && <hr className='border-t-gray-200'/>}
                              <div className='flex py-4'>
                                <div className='flex min-w-0 flex-1 flex-col'>
                                  <p className='text-emerald-800 text-md font-bold'>{item.name}</p>
                                  <p className='text-gray-500 text-sm'>{item.quantity} x ${item.unitPriceCents / 100}</p>
                                </div>
                                <div className='flex shrink-0 justify-end'>
                                  <p className='text-emerald-800 font-bold'>${item.lineTotalCents / 100}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        <div className='flex justify-between items-end py-4'>
                          <p className='text-emerald-800 font-bold'>Estimated total</p>
                          <p className='text-emerald-800 text-3xl font-bold'>${quote.totalCents / 100}</p>
                        </div>
                        <div>
                          <p className='text-gray-500 text-xs'>This estimate is calculated from the current service rates.</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {error !== "" && status && (
                      <p className="text-red-500">
                        An error occurred processing the request: {status}{" "}
                        {error}{" "}
                      </p>
                    )}
                    {error !== "" && !status && (
                      <p className="text-red-500">{error} </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className='my-10 mx-4 sm:mx-6 lg:mx-10 xl:mx-20 2xl:mx-30'>
          <div className='flex flex-wrap justify-between text-sm'>
            <p className='text-emerald-900'>Every project begins with a useful conversation.</p>
            <p className='text-emerald-800 font-bold tracking-wide underline underline-offset-4 decoration-amber-600 decoration-2'><a href="mailto:hello@goodwork.example">hello@goodwork.example</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
