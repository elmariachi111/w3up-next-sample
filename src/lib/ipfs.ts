import * as Delegation from '@ucanto/core/delegation'
import * as W3SClient from '@web3-storage/w3up-client'
import { UploadOptions } from '@web3-storage/w3up-client/types'
//import { UploadOptions } from '@web3-storage/w3up-client/dist/src/types'
import { create as createIpfsClient, IPFSHTTPClient } from 'kubo-rpc-client'
import { CID } from 'multiformats/cid'

export function onlyDigest(cid: string) {
  //bafkreigk5dvqblnkdniges6ft5kmuly47ebw4vho6siikzmkaovq6sjstq
  const parsedCID = CID.parse(cid)
  console.log('CID', parsedCID)
  const digest = parsedCID.multihash.digest
  return digest
}

interface IWeb3StorageClient {
  init(): Promise<unknown>
  uploadFile(file: File, options: UploadOptions): Promise<CID>
}

export class LocalIpfsClient implements IWeb3StorageClient {
  private client: IPFSHTTPClient

  constructor(url = 'http://127.0.0.1:5001/api/v0') {
    this.client = createIpfsClient({ url })
  }

  async init() {
    return Promise.resolve(this.client)
  }

  async uploadFile(file: File, options: UploadOptions) {
    const result = await this.client.add(file, {
      ...options,
      cidVersion: 1,
      wrapWithDirectory: false
    })
    return result!.cid as unknown as CID
  }
}

export class Web3StorageClient implements IWeb3StorageClient {
  private client: W3SClient.Client | null | undefined

  async init() {
    if (!this.client) {
      this.client = await W3SClient.create()
      const UCAN = await this.fetchUCAN(this.client.agent.did())
      const delegation = await Delegation.extract(new Uint8Array(UCAN))

      if (!delegation.ok) {
        throw new Error('Failed to extract delegation', {
          cause: delegation.error
        })
      }
      const space = await this.client.addSpace(delegation.ok)
      await this.client.setCurrentSpace(space.did())
    }

    return this.client
  }

  private async fetchUCAN(did: string) {
    return fetch('/api/w3up-delegation', {
      method: 'POST',
      body: JSON.stringify({ did }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => res.arrayBuffer())
  }

  async uploadFile(file: File, options: UploadOptions) {
    if (!this.client) throw new Error('Web3Storage client not initialized')
    const result = await this.client?.uploadFile(file, options)
    return result as unknown as CID
  }
}

export const canUseWeb3Storage = () => {
  if (typeof window !== 'undefined' && 'Cypress' in window) return false

  return process.env.NEXT_PUBLIC_IPFS_HOST ? false : true
}

/**
 * checks whether the environment allows using web3.storage
 * or falls back to a local ipfs host
 *
 * @returns Web3Storage
 */
export const makeWeb3StorageClient = async (): Promise<IWeb3StorageClient> => {
  const client = canUseWeb3Storage()
    ? new Web3StorageClient()
    : new LocalIpfsClient()
  await client.init()
  return client
}
