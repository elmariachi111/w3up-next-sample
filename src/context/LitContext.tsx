import { LitNodeClient } from '@lit-protocol/lit-node-client'
import { AuthSig } from '@lit-protocol/types'
import React, { useContext, useEffect } from 'react'

interface ILitContext {
  litClient?: LitNodeClient
  authSig?: AuthSig
}

const LitContext = React.createContext<ILitContext>({
  litClient: undefined,
  authSig: undefined //forwarded for convenience
})

const useLit = () => useContext(LitContext)

const LitProvider = ({ children }: { children: React.ReactNode }) => {
  const [litClient, setClient] = React.useState<any>()
  const { authSig } = { authSig: {sig: "foo", derivedVia: "moo", signedMessage: "qoo", address: "0xb007"} }

  useEffect(() => {
    if (!authSig) return
    // see https://developer.litprotocol.com/SDK/Explanation/WalletSigs/authSig

    const client = new LitNodeClient({
      litNetwork: 'jalapeno',
      debug: process.env.NODE_ENV != 'production'
    })
    client.connect().then(() => {
      setClient(client)
    })
  }, [authSig])

  return (
    <LitContext.Provider value={{ litClient, authSig }}>
      {children}
    </LitContext.Provider>
  )
}

export { LitProvider, useLit }
