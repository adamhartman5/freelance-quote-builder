import { createServerFn } from '@tanstack/react-start'
import serviceData from '../../data/services.json'

export const getServices = createServerFn({ method: 'GET'})
  .handler(async () => {
    return serviceData
  })