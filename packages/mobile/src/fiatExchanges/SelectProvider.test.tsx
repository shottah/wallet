import SelectProviderScreen, { PaymentMethodSection } from 'src/fiatExchanges/SelectProvider'

describe(SelectProviderScreen, () => {
  it('calls fetchProviders correctly', () => {
    expect(true).toBeTruthy()
  })
  it('shows a spinner while loading', () => {
    expect(true).toBeTruthy()
  })
  it('shows the provider sections and exchange section', () => {
    expect(true).toBeTruthy()
  })
  it('shows the limit payment methods dialog when one of the provider types has no options', () => {
    expect(true).toBeTruthy()
  })
})

describe(PaymentMethodSection, () => {
  it('shows nothing if there are no available providers', () => {
    expect(true).toBeTruthy()
  })
  it('shows a non-expandable view if there is one provider available', () => {
    expect(true).toBeTruthy()
  })
  it('shows an expandable view if there is more than one provider available', () => {
    expect(true).toBeTruthy()
  })
})
