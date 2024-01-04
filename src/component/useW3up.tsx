import { createW3upClient } from '@/lib/createClient'
import { create, Client } from '@web3-storage/w3up-client'
import { useEffect, useState } from 'react'

export const useW3up = () => { 
  const [client, setClient] = useState<Client>()
 useEffect(() => {
  (async() => {
    setClient(await createW3upClient())
  })()
 },[])

 return client
}