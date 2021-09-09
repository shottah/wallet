import colors from '@celo/react-components/styles/colors'
import React from 'react'
import { Button, Image, Linking, StyleSheet, Text, View } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import { SafeAreaView } from 'react-native-safe-area-context'
import RNQRGenerator from 'rn-qr-generator'

export default function QRSelector() {
  const [response, setResponse] = React.useState<any>(null)
  const [, setDetectedValues] = React.useState<any>([])

  const onButtonPress = React.useCallback((type, options) => {
    launchImageLibrary(options, setResponse)
  }, [])

  const getQRValues = async () => {
    RNQRGenerator.detect({ uri: response.assets[0].uri })
      .then((res) => {
        if (res.values.length === 0) {
          setDetectedValues(['QR code not found'])
          alert('QR code not found')
        } else {
          setDetectedValues(res.values)
          Linking.openURL(res.values[0]).catch((err) => console.error("Couldn't load page", err))
        }
      })
      .catch((err) => {
        console.warn('Cannot detect', err)
      })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="Select Image"
          onPress={() =>
            onButtonPress('library', {
              maxHeight: 200,
              maxWidth: 200,
              selectionLimit: 1,
              mediaType: 'photo',
              includeBase64: false,
            })
          }
        ></Button>
        <Button title="Use QR Code" onPress={() => getQRValues()} disabled={!response}></Button>
      </View>
      {response !== null ? (
        <View style={styles.imageContainer}>
          {response && response.assets && response.assets[0].uri ? (
            <Image
              source={{
                uri: `${response.assets[0].uri}`,
                width: 200,
                height: 200,
              }}
            />
          ) : (
            <Text style={styles.text}>{JSON.stringify(response, null, 2)}</Text>
          )}
        </View>
      ) : (
        <></>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colors.dark,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-evenly',
    marginVertical: 8,
    marginTop: 100,
  },
  imageContainer: {
    backgroundColor: colors.light,
    flexShrink: 1,
    marginVertical: 8,
    padding: 8,
    borderRadius: 8,
  },
  text: {
    color: 'black',
  },
})
