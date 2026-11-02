import { createServerFn } from '@tanstack/react-start'
import serviceData from '../../data/services.json'

export const getServices = createServerFn({ method: 'GET'})
  .handler(async () => {
    return serviceData
  })

export const getService = createServerFn({ method: 'GET'})
  .inputValidator(( data: string) => {
    if (typeof data !== 'string'){
      throw new Error('Service ID must be a string')
    }
    return data
  })
  .handler(async ({data}) => {
    const selectedService = serviceData.find((service) => service.id === data)
    if (!selectedService){
      return null
    }
    return selectedService
  })