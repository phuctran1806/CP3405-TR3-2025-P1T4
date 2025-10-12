import React from 'react';
import {
  Checkbox as GSCheckbox,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxIcon,
} from '@/components/ui/checkbox';
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
  size = 'md',
}) => {
  return (
    <GSCheckbox
      isChecked={checked}
      onChange={onToggle}
      isDisabled={disabled}
      isInvalid={invalid}
      size={size}
      value={label}
    >
      <CheckboxIndicator>
        <CheckboxIcon as={CheckIcon} />
      </CheckboxIndicator>
      <CheckboxLabel>{label}</CheckboxLabel>
    </GSCheckbox>
  );
};

export default CheckBox;

