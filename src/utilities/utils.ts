export function centsToDollars(price: number, currencyUnit: string) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyUnit,
    }).format(price / 100)
  }