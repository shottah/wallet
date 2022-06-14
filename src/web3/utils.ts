import { CeloTx, CeloTxObject, CeloTxReceipt } from '@celo/connect'
import BigNumber from 'bignumber.js'
import { call } from 'redux-saga/effects'
import { GAS_INFLATION_FACTOR } from 'src/config'
import Logger from 'src/utils/Logger'
import { getContractKitAsync, getWeb3, getWeb3Async } from 'src/web3/contracts'

const TAG = 'web3/utils'

// Estimate gas taking into account the configured inflation factor
export async function estimateGas(txObj: CeloTxObject<any>, txParams: CeloTx): Promise<BigNumber> {
  const contractKit = await getContractKitAsync()
  const gasEstimator = (_tx: CeloTx) => txObj.estimateGas({ ..._tx })
  const getCallTx = (_tx: CeloTx) => {
    // @ts-ignore missing _parent property from TransactionObject type.
    return { ..._tx, data: txObj.encodeABI(), to: txObj._parent._address }
  }
  const caller = (_tx: CeloTx) => contractKit.connection.web3.eth.call(getCallTx(_tx))

  contractKit.connection.defaultGasInflationFactor = GAS_INFLATION_FACTOR
  const gas = new BigNumber(
    await contractKit.connection.estimateGasWithInflationFactor(txParams, gasEstimator, caller)
  )
  return gas
}

// Fetches the transaction receipt for a given hash, returning null if the transaction has not been mined.
export async function getTransactionReceipt(txHash: string): Promise<CeloTxReceipt | null> {
  Logger.debug(TAG, `Getting transaction receipt for ${txHash}`)
  const contractkit = await getContractKitAsync()
  return contractkit.connection.getTransactionReceipt(txHash)
}

// Note: This returns Promise<Block>
export async function getLatestBlock() {
  Logger.debug(TAG, 'Getting latest block')
  const web3 = await getWeb3Async()
  return web3.eth.getBlock('latest')
}

export async function getLatestBlockNumber() {
  Logger.debug(TAG, 'Getting latest block number')
  const web3 = await getWeb3Async()
  return web3.eth.getBlockNumber()
}

// TODO Warning: this approach causes problems in certain cases where
// parallel txs are being sent
export function* getLatestNonce(address: string) {
  Logger.debug(TAG, 'Fetching latest nonce (incl. pending)')
  const web3 = yield call(getWeb3)
  // Note tx count is 1-indexed but nonces are 0-indexed
  const nonce = (yield call(web3.eth.getTransactionCount, address, 'pending')) - 1
  Logger.debug(TAG, `Latest nonce found: ${nonce}`)
  return nonce
}

export async function getContract(abi: any, tokenAddress: string) {
  const kit = await getContractKitAsync()
  return new kit.web3.eth.Contract(abi, tokenAddress)
}
