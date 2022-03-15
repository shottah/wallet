import networkConfig from 'src/geth/networkConfig'
import { FinclusiveKycStatus } from 'src/account/reducer'
import { GethNativeBridgeWallet } from '../geth/GethNativeBridgeWallet'

interface RequiredParams {
  walletAddress: string
  wallet: GethNativeBridgeWallet
  publicKey: string
}

/**
 * get the status of a users finclusive compliance check aka their KYC status
 *
 *
 * @param {params.walletAddress} walletAddress
 * @param {params.jwt} jwt to use for authentication. may be non-expiring.
 * @returns {FinclusiveKycStatus} the users current status
 */
export const getFinclusiveComplianceStatus = async ({
  walletAddress,
  jwt,
}: {
  walletAddress: string
  jwt: string
}): Promise<FinclusiveKycStatus> => {
  const response = await signAndFetch({
    path: `/account/${encodeURIComponent(walletAddress)}/compliance-check-status`,
    jwt,
    requestOptions: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  })
  if (!response.ok) {
    throw new Error(
      `IHL GET /account/:accountAddress/compliance-check-status failure status ${response.status}`
    )
  }
  const { complianceCheckStatus } = await response.json()
  return complianceCheckStatus
}

type DeleteFinclusiveBankAccountParams = RequiredParams & {
  id: number
}

/**
 * get a fiat bank account from finclusive
 *
 * @param {params.walletAddress} walletAddress
 * @param {params.publicKey} publicKey
 * @param {params.wallet} wallet
 * @param {params.id} id: IHL ID for the bank account to delete
 */
export const deleteFinclusiveBankAccount = async ({
  walletAddress,
  publicKey,
  wallet,
  id,
}: DeleteFinclusiveBankAccountParams): Promise<void> => {
  const body = {
    accountAddress: walletAddress,
    accountId: id,
  }
  const response = await signWithWalletAndFetch({
    path: `/account/bank-account?accountAddress=${encodeURIComponent(walletAddress)}`,
    walletAddress,
    publicKey,
    wallet,
    requestOptions: {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  })
  if (!response.ok) {
    throw new Error(`IHL DELETE /account/bank-account failure status ${response.status}`)
  }
}

export interface BankAccount {
  id: number
  accountName: string
  accountType: string
  accountNumberTruncated: string
}

/**
 * get a users fiat bank accounts from finclusive
 *
 *
 * @param {params.walletAddress} walletAddress
 * @param {params.publicKey} publicKey
 * @param {params.wallet} wallet
 * @returns {BankAccounts} List of bank accounts that the user has linked
 */
export const getFinclusiveBankAccounts = async ({
  walletAddress,
  publicKey,
  wallet,
}: RequiredParams): Promise<BankAccount[]> => {
  const response = await signWithWalletAndFetch({
    path: `/account/bank-account?accountAddress=${encodeURIComponent(walletAddress)}`,
    walletAddress,
    publicKey,
    wallet,
    requestOptions: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  })
  if (!response.ok) {
    throw new Error(`IHL GET /account/bank-account failure status ${response.status}`)
  }
  const { bankAccounts } = await response.json()
  return bankAccounts
}

type CreateFinclusiveBankAccountParams = RequiredParams & {
  plaidAccessToken: string
}

/**
 * Create a fiat bank account with finclusive
 *
 *
 * @param {params.walletAddress} walletAddress
 * @param {params.publicKey} publicKey
 * @param {params.wallet} wallet
 * @param {params.plaidAccessToken} plaidAccessToken plaid long term access token
 */
export const createFinclusiveBankAccount = async ({
  walletAddress,
  publicKey,
  wallet,
  plaidAccessToken,
}: CreateFinclusiveBankAccountParams): Promise<void> => {
  const body = {
    accountAddress: walletAddress,
    plaidAccessToken,
  }
  const response = await signWithWalletAndFetch({
    path: '/account/bank-account',
    walletAddress,
    publicKey,
    wallet,
    requestOptions: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  })
  if (!response.ok) {
    throw new Error(`IHL POST /account/bank-account failure status ${response.status}`)
  }
}

type ExchangePlaidAccessTokenParams = RequiredParams & {
  publicToken: string
}

/**
 * Exchange a plaid plublic token for a long-term plaid access token
 *
 *
 * @param {params.walletAddress} walletAddress
 * @param {params.publicKey} publicKey
 * @param {params.wallet} wallet
 * @param {params.publicToken} publicToken plaid public token
 * @returns {accessToken} string accesstoken from plaid
 */
export const exchangePlaidAccessToken = async ({
  walletAddress,
  publicKey,
  wallet,
  publicToken,
}: ExchangePlaidAccessTokenParams): Promise<string> => {
  const body = {
    publicToken,
    accountAddress: walletAddress,
  }
  const response = await signWithWalletAndFetch({
    path: '/plaid/access-token/exchange',
    walletAddress,
    publicKey,
    wallet,
    requestOptions: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  })
  if (!response.ok) {
    throw new Error(`IHL /plaid/access-token/exchange failure status ${response.status}`)
  }
  const { accessToken } = await response.json()
  return accessToken
}

type CreateLinkTokenParams = RequiredParams & {
  isAndroid: boolean
  language: string
  accessToken?: string
  phoneNumber: string
}

/**
 * Create a new Plaid Link Token by calling IHL
 *
 *
 * @param {params.walletAddress} walletAddress
 * @param {params.publicKey} publicKey
 * @param {params.wallet} wallet
 * @param {params.isAndroid} isAndroid
 * @param {params.language} language the users current language
 * @param {params.accessToken} accessToken optional access token used for editing existing items
 * @param {params.phoneNumber} phoneNumber users verified phone number
 * @returns {linkToken} the link token from the plaid backend
 */
export const createLinkToken = async ({
  walletAddress,
  publicKey,
  wallet,
  isAndroid,
  language,
  accessToken,
  phoneNumber,
}: CreateLinkTokenParams): Promise<string> => {
  const body = {
    accountAddress: walletAddress,
    isAndroid,
    language,
    accessToken,
    phoneNumber,
  }
  const response = await signWithWalletAndFetch({
    path: '/plaid/link-token/create',
    publicKey,
    wallet,
    walletAddress,
    requestOptions: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  })
  if (!response.ok) {
    throw new Error(`IHL /plaid/link-token/create failure status ${response.status}`)
  }
  const { linkToken } = await response.json()
  return linkToken
}

/**
 * Create a Persona account for the given accountMTWAddress
 *
 *
 * @param {params.walletAddress} walletAddress
 * @param {params.wallet} wallet
 * @param {params.publicKey} publicKey
 */
export const createPersonaAccount = async ({
  walletAddress,
  wallet,
  publicKey,
}: RequiredParams): Promise<void> => {
  const body = { accountAddress: walletAddress }
  const response = await signWithWalletAndFetch({
    path: '/persona/account/create',
    wallet,
    publicKey,
    walletAddress,
    requestOptions: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    },
  })
  if (response.status !== 201 && response.status !== 409) {
    throw new Error(`IHL /persona/account/create failure status ${response.status}`)
  }
}

interface SignAndFetchParams {
  path: string
  jwt: string
  requestOptions: RequestInit
}

export const signWithWalletAndFetch = async ({
  path,
  requestOptions,
  wallet,
  walletAddress,
  publicKey,
}: Omit<SignAndFetchParams, 'jwt'> & {
  wallet: GethNativeBridgeWallet
  walletAddress: string
  publicKey: string
}): Promise<Response> => {
  return signAndFetch({
    path,
    jwt: await wallet.getExpiringJWT({ publicKey, walletAddress }),
    requestOptions,
  })
}

/**
 * A fetch wrapper that adds in the signature needed for IHL authorization
 *
 *
 * @param {params.path} string like /persona/get/foo
 * @param {params.jwt} jwt
 * @param {params.requestOptions} requestOptions all the normal fetch options
 * @returns {Response} response object from the fetch call
 */
export const signAndFetch = async ({
  path,
  jwt,
  requestOptions,
}: SignAndFetchParams): Promise<Response> => {
  return fetch(`${networkConfig.inHouseLiquidityURL}${path}`, {
    ...requestOptions,
    headers: {
      ...requestOptions.headers,
      Authorization: `Bearer ${jwt}`,
    },
  })
}
