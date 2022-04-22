import { RouteProp } from '@react-navigation/core'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useAsync } from 'react-async-hook'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import { FiatExchangeEvents } from 'src/analytics/Events'
import ValoraAnalytics from 'src/analytics/ValoraAnalytics'
import { celoEuroEnabledSelector } from 'src/app/selectors'
import BackButton from 'src/components/BackButton'
import Button, { BtnSizes, BtnTypes } from 'src/components/Button'
import Touchable from 'src/components/Touchable'
import FundingEducationDialog from 'src/fiatExchanges/FundingEducationDialog'
import i18n from 'src/i18n'
import InfoIcon from 'src/icons/InfoIcon'
import RadioButton from 'src/icons/RadioButton'
import { emptyHeader } from 'src/navigator/Headers'
import { navigate } from 'src/navigator/NavigationService'
import { Screens } from 'src/navigator/Screens'
import { StackParamList } from 'src/navigator/types'
import colors from 'src/styles/colors'
import fontStyles from 'src/styles/fonts'
import variables from 'src/styles/variables'
import { Currency } from 'src/utils/currencies'

type RouteProps = StackScreenProps<StackParamList, Screens.FiatExchangeOptions>
type Props = RouteProps

export enum PaymentMethod {
  Card = 'Card',
  Bank = 'Bank',
  Exchange = 'Exchange',
  Address = 'Address',
  LocalProvider = 'LocalProvider',
  GiftCard = 'GiftCard',
}

export const fiatExchangesOptionsScreenOptions = ({
  route,
}: {
  route: RouteProp<StackParamList, Screens.FiatExchangeOptions>
}) => {
  const eventName = route.params?.isCashIn
    ? FiatExchangeEvents.cico_add_funds_back
    : FiatExchangeEvents.cico_cash_out_back

  return {
    ...emptyHeader,
    headerLeft: () => <BackButton eventName={eventName} />,
    headerTitle: i18n.t(`${route.params?.isCashIn ? 'addFunds' : 'cashOut'}`),
    headerRightContainerStyle: { paddingRight: 16 },
  }
}

function CurrencyRadioItem({
  selected,
  onSelect,
  enabled = true,
  title,
  body,
  containerStyle,
  testID,
}: {
  selected: boolean
  onSelect: () => void
  enabled?: boolean
  title: string
  body?: string
  containerStyle: ViewStyle
  testID?: string
}) {
  return (
    <TouchableWithoutFeedback onPress={onSelect} disabled={!enabled}>
      <View
        style={[
          styles.currencyItemContainer,
          containerStyle,
          { borderColor: selected ? colors.greenUI : colors.gray3 },
        ]}
        testID={testID}
      >
        <RadioButton selected={selected} disabled={!enabled} />
        <Text style={[styles.currencyItemTitle, enabled ? {} : { color: colors.gray3 }]}>
          {title}
        </Text>
        {body && <Text style={styles.currencyItemBody}>{body}</Text>}
      </View>
    </TouchableWithoutFeedback>
  )
}

function FiatExchangeOptions({ route, navigation }: Props) {
  const { t } = useTranslation()
  const isCashIn = route.params?.isCashIn ?? true
  const celoEuroEnabled = useSelector(celoEuroEnabledSelector)

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(Currency.Dollar)
  isCashIn ? PaymentMethod.Card : PaymentMethod.Exchange

  const [isEducationDialogVisible, setEducationDialogVisible] = useState(false)

  const goToProvider = () => {
    ValoraAnalytics.track(FiatExchangeEvents.cico_option_chosen, {
      isCashIn,
      currency: selectedCurrency,
    })
    navigate(Screens.FiatExchangeAmount, {
      currency: selectedCurrency,
      isCashIn,
    })
  }

  const onSelectCurrency = (currency: Currency) => () => setSelectedCurrency(currency)

  const onPressInfoIcon = () => {
    setEducationDialogVisible(true)
    ValoraAnalytics.track(
      isCashIn ? FiatExchangeEvents.cico_add_funds_info : FiatExchangeEvents.cico_cash_out_info
    )
  }

  const onPressDismissEducationDialog = () => {
    setEducationDialogVisible(false)
    ValoraAnalytics.track(
      isCashIn
        ? FiatExchangeEvents.cico_add_funds_info_cancel
        : FiatExchangeEvents.cico_cash_out_info_cancel
    )
  }

  return (
    <SafeAreaView style={styles.content}>
      <ScrollView style={styles.topContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.selectDigitalCurrency}>{t('selectDigitalCurrency')}</Text>
          <Touchable onPress={onPressInfoIcon} hitSlop={variables.iconHitslop}>
            <InfoIcon size={14} color={colors.gray3} />
          </Touchable>
        </View>
        <View style={styles.currenciesContainer}>
          <CurrencyRadioItem
            title={t('celoDollar')}
            body="(cUSD)"
            selected={selectedCurrency === Currency.Dollar}
            onSelect={onSelectCurrency(Currency.Dollar)}
            containerStyle={{
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              borderBottomWidth: 0.5,
            }}
            testID="radio/cUSD"
          />
          <CurrencyRadioItem
            title={t('celoEuro')}
            body="(cEUR)"
            selected={selectedCurrency === Currency.Euro}
            onSelect={onSelectCurrency(Currency.Euro)}
            containerStyle={{
              borderTopWidth: 0.5,
              borderBottomWidth: 0.5,
            }}
            testID="radio/cEUR"
          />
          <CurrencyRadioItem
            title="CELO"
            selected={selectedCurrency === Currency.Celo}
            onSelect={onSelectCurrency(Currency.Celo)}
            containerStyle={{
              borderTopWidth: 0.5,
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
            testID="radio/CELO"
          />
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <Button
          style={styles.goToProvider}
          type={BtnTypes.PRIMARY}
          size={BtnSizes.FULL}
          text={t('next')}
          onPress={goToProvider}
          testID={'GoToProviderButton'}
        />
      </View>
      <FundingEducationDialog
        isVisible={isEducationDialogVisible}
        onPressDismiss={onPressDismissEducationDialog}
        isCashIn={isCashIn}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: colors.gray1,
  },
  topContainer: {
    paddingHorizontal: variables.contentPadding,
    backgroundColor: colors.light,
  },
  titleContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: variables.contentPadding,
  },
  selectDigitalCurrency: {
    ...fontStyles.regular,
    marginRight: 12,
  },
  currenciesContainer: {
    flexDirection: 'column',
    marginTop: 8,
  },
  currencyItemContainer: {
    flexDirection: 'row',
    padding: variables.contentPadding,
    borderWidth: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  currencyItemTitle: {
    ...fontStyles.regular500,
    marginLeft: variables.contentPadding,
  },
  currencyItemBody: {
    ...fontStyles.regular500,
    color: colors.gray4,
    marginLeft: 4,
  },
  bottomContainer: {
    flexDirection: 'column',
    paddingHorizontal: variables.contentPadding,
  },
  goToProvider: {
    width: '50%',
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
})

export default FiatExchangeOptions
