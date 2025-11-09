import React from 'react';
import {
  Box,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '@gluestack-ui/themed';
import { ChevronDown } from 'lucide-react-native';

export type TabType = 'All Venues' | 'Lecturers Assignments';

interface AdminDropdownMenuProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function AdminDropdownMenu({
  activeTab,
  setActiveTab,
}: AdminDropdownMenuProps) {
  return (
    <Box mb="$4">
      <Select selectedValue={activeTab} onValueChange={(val: string) => setActiveTab(val as TabType)}>
        <SelectTrigger>
          <SelectInput placeholder="Select section" value={activeTab} />
          <SelectIcon as={ChevronDown} />
        </SelectTrigger>

        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            <SelectItem label="All Venues" value="All Venues" />
            <SelectItem label="Lecturer Assignments" value="Lecturers Assignments" />
          </SelectContent>
        </SelectPortal>
      </Select>
    </Box>
  );
}
