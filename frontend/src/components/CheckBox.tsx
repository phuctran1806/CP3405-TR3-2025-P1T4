import React from 'react';
import {
  Checkbox as GSCheckbox,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxIcon,
  Box,
  HStack,
} from "@gluestack-ui/themed";
import { CheckIcon } from '@/components/ui/icon';

interface CheckBoxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const CheckBox: React.FC<CheckBoxProps> = ({
  checked,
  onToggle,
  label,
  disabled = false,
  invalid = false,
  size = 'sm',
}) => {
  return (
    <HStack>
      <GSCheckbox
        isChecked={checked}
        onChange={onToggle}
        isDisabled={disabled}
        isInvalid={invalid}
        size={size}
        value={label}
        mr="$3"
      >
        <CheckboxIndicator>
          <CheckboxIcon as={CheckIcon} />
        </CheckboxIndicator>
        <CheckboxLabel>{label}</CheckboxLabel>
      </GSCheckbox>
    </HStack>
  );
};

export default CheckBox;

