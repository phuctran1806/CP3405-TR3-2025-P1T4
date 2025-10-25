import React from 'react';
import { Box, Text } from '@gluestack-ui/themed';

export default function SummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
    return (
        <Box
            flexBasis="48%"
            bg="$white"
            borderRadius="$xl"
            p="$4"
            mb="$3"
            shadowColor="#000"
            shadowOpacity={0.05}
            shadowRadius={4}
            elevation={2}
        >
            <Text fontSize="$sm" color="$gray500">
                {title}
            </Text>
            <Text fontSize="$xl" fontWeight="$bold" color="$black">
                {value}
            </Text>
            <Text color="$gray500" fontSize="$xs">
                {subtitle}
            </Text>
        </Box>
    );
}