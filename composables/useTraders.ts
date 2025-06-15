import { eftTraders, getTraderByName, getTraderImageLink } from '~/data/traders'

export const useTraders = () => {
  return {
    traders: eftTraders,
    getTraderByName,
    getTraderImageLink
  }
}