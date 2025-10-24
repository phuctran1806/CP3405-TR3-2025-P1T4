import React from 'react';
import { Box, VStack, Text } from '@gluestack-ui/themed';

const StatBox = ({ label, value, bg, borderColor, textColor }: any) => (
  <Box flex={1} bg={bg} borderRadius="$xl" p="$4" borderWidth={1} borderColor={borderColor}>
    <VStack space="xs">
      <Text fontSize="$xs" color={textColor} fontWeight="$semibold">
        {label}
      </Text>
      <Text fontSize="$xl" fontWeight="$bold" color={textColor}>
        {value}
      </Text>
    </VStack>
  </Box>
);

export default StatBox;
