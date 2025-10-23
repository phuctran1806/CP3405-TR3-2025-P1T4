import React from 'react';
import { HStack, Button, Text } from '@gluestack-ui/themed';

const SegmentedControl = ({ view, setView }: any) => (
  <HStack bg="$gray100" borderRadius="$full" p="$1">
    {['statistics', 'schedule'].map((v) => (
      <Button
        key={v}
        flex={1}
        variant="solid"
        bg={view === v ? '$blue500' : 'transparent'}
        onPress={() => setView(v as any)}
        borderRadius="$full"
        h={25}
        shadowColor={view === v ? '$blue500' : 'transparent'}
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={view === v ? 0.3 : 0}
        shadowRadius={4}
        py="$0"
      >
        <Text color={view === v ? '$white' : '$gray600'} fontWeight="$semibold" fontSize="$sm">
          {v === 'statistics' ? 'Statistics' : 'Schedule'}
        </Text>
      </Button>
    ))}
  </HStack>
);

export default SegmentedControl;
