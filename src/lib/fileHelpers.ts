import { canUseWeb3Storage, makeWeb3StorageClient } from '@/lib/ipfs'
import { deserialize } from 'wagmi'

type CIDString = string

export const uploadFile = async (
  file: File,
): Promise<{
  file: File
  url: string
  cid?: CIDString
}> => {
  
    console.debug('uploading %s to ipfs', file.name)
    const client = await makeWeb3StorageClient()
    const result = await client.uploadFile(file, {})
    console.debug('uploaded %s, CID: %s', file.name, result)

    return {
      file,
  
      url: `ipfs://${result}`,
      cid: result.toString()
    }
  }

export const convertToGatewayUrl = (hash: string): string => {
  if (hash.startsWith('ar://')) {
    return `https://arweave.net/${hash.replace('ar://', '')}`
  }
  if (hash.startsWith('ipfs://')) {
    const gatewayUrl =
      canUseWeb3Storage() && !process.env.NEXT_PUBLIC_IPFS_HOST
        ? 'https://w3s.link'
        : process.env.NEXT_PUBLIC_IPFS_HOST || 'http://localhost:8080'

    return `${gatewayUrl}/ipfs/${hash.replace('ipfs://', '')}`
  }

  return hash
}

export async function fetchURLs(sources: (string | undefined)[]) {
  const promises = sources.map((s) => {
    if (!s) return undefined
    return (async () => {
      const result = await fetch(convertToGatewayUrl(s))
      return deserialize(await result.text()) as any
    })()
  })
  return Promise.all(promises)
}
