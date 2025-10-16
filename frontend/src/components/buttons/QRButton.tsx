import React from 'react';
import { Box, VStack, Text, Button, ButtonText } from '@gluestack-ui/themed';
import { QrCode } from 'lucide-react-native';
import { Alert } from 'react-native';

export default function QRScan() {
  const handleScan = () => {
    Alert.alert('QR Scanner', 'QR scanning functionality will be implemented here');
  };

  return (
    <Box flex={1} bg="$black" justifyContent="center" alignItems="center" p="$4">
      <Box
        width={300}
        height={300}
        borderWidth={4}
        borderColor="$white"
        borderRadius="$xl"
        justifyContent="center"
        alignItems="center"
        mb="$6"
      >
        <QrCode size={120} color="#ffffff" />
      </Box>
      
      <VStack space="sm" alignItems="center" mb="$6">
        <Text fontSize="$xl" fontWeight="$bold" color="$white">
          Scan QR Code
        </Text>
        <Text fontSize="$md" color="$gray300" textAlign="center">
          Point your camera at a QR code to check in
        </Text>
      </VStack>

      <Button
        size="lg"
        bg="$blue500"
        onPress={handleScan}
        width="80%"
      >
        <ButtonText>Start Scanner</ButtonText>
      </Button>
    </Box>
  );
}