import { CheckIcon } from '@/components/ui/icon';
import {
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  Checkbox as GSCheckbox,
  HStack,
} from "@gluestack-ui/themed";
import React from 'react';

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

