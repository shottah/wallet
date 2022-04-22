import { fireEvent, render } from '@testing-library/react-native'
import BigNumber from 'bignumber.js'
import * as React from 'react'
import { Provider } from 'react-redux'
import FiatExchangeOptions from 'src/fiatExchanges/FiatExchangeOptions'
import { Screens } from 'src/navigator/Screens'
import { createMockStore, getMockStackScreenProps } from 'test/utils'
import { navigate } from 'src/navigator/NavigationService'

const mockScreenProps = (isCashIn: boolean) =>
  getMockStackScreenProps(Screens.FiatExchangeOptions, {
    isCashIn,
    amount: new BigNumber('1'),
  })

describe('FiatExchangeOptions', () => {
  beforeEach(() => {
    jest.useRealTimers()
  })

  it('renders correctly', () => {
    const tree = render(
      <Provider store={createMockStore({})}>
        <FiatExchangeOptions {...mockScreenProps(true)} />
      </Provider>
    )
    expect(tree.getByText('(cUSD)')).toBeTruthy()
    expect(tree.getByText('(cEUR)')).toBeTruthy()
    expect(tree.getByText('CELO')).toBeTruthy()

    fireEvent.press(tree.getByText('next'))
    expect(navigate).toHaveBeenCalledWith(Screens.FiatExchangeAmount, {
      currency: 'cUSD',
      isCashIn: true,
    })
  })
})
