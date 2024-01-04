import { create, Client } from '@web3-storage/w3up-client'

export const createW3upClient = async () => {
  const cl = create();
  return cl
}