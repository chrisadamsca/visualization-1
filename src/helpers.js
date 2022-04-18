export const trunc = (num, decimalPlaces) => {
  return Math.round((num + Number.EPSILON) * (decimalPlaces * 10)) / (decimalPlaces * 10)
}