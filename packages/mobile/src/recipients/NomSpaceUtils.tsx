import { newKit } from '@celo/contractkit'
import { NomKit } from '@nomspace/nomspace'
import { utils } from 'ethers'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const MAINNET_ADDRESS = '0xABf8faBbC071F320F222A526A2e1fBE26429344d'
// const ALFAJORES_ADDRESS = "0x36C976Da6A6499Cad683064F849afa69CD4dec2e"

export async function getAddressFromAlias(alias: string) {
  console.log(utils.formatBytes32String(alias))
  const kit = newKit('https://forno.celo.org')
  const nomKit = new NomKit(kit, MAINNET_ADDRESS)
  const address = await nomKit.resolve(alias)
  if (address === ZERO_ADDRESS) {
    return undefined
  }
  console.log(`Alias found: ${alias} -> ${address}`)
  return address
}
