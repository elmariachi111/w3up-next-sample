// https://web3.storage/docs/how-to/upload/#delegate-ucan-for-your-user-to-upload-directly
import { CarReader } from '@ipld/car'
import * as DID from '@ipld/dag-ucan/did'
import * as Delegation from '@ucanto/core/delegation'
import * as Signer from '@ucanto/principal/ed25519'
import { StoreMemory } from '@web3-storage/access/stores/store-memory'
import * as Client from '@web3-storage/w3up-client'
import { NextApiRequest, NextApiResponse } from 'next'

/** @param {string} data Base64 encoded CAR file */
async function parseProof(data: string) {
  // this cannot be correctly typed as there seems to be a version mismatch in the types; should be UCANBlock[]
  const blocks: any[] = []
  const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'))
  for await (const block of reader.blocks()) {
    blocks.push(block)
  }
  return Delegation.importDAG(blocks)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res
      .status(405)
      .setHeader('Allow', ['POST'])
      .end(`Method ${req.method} Not Allowed`)
    return
  }

  const did = DID.parse(req.body.did as string)
  if (!did) {
    return res.status(401).json({ error: 'Invalid DID' })
  }

  // Load client with specific private key
  const client = await Client.create({
    principal: Signer.parse(process.env.W3UP_PRIVATE_KEY as string),
    store: new StoreMemory()
  })

  // Add proof that this agent has been delegated capabilities on the space
  const proof = await parseProof(process.env.W3UP_DELEGATION_PROOF as string)
  const space = await client.addSpace(proof)
  await client.setCurrentSpace(space.did())

  // Create a delegation for a specific DID
  const ONE_HOUR = Math.floor(Date.now() / 1000) + 60 * 60 // 24 hours from now

  const delegation = await client.createDelegation(
    did,
    ['store/add', 'upload/add'],
    {
      expiration: ONE_HOUR
    }
  )

  // Serialize the delegation and send it to the client
  const archive = await delegation.archive()
  if (!archive.ok) {
    return res.status(500).json({ error: archive.error })
  }

  return res
    .setHeader('Content-Type', 'application/octet-stream')
    .status(200)
    .send(Buffer.from(archive.ok))
}
