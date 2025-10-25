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

export type TabType = 'All Venues' | 'Requests' | 'Lecturers';

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
            <SelectItem label="All Venues" value="venues" />
            <SelectItem label="Booking Requests" value="requests" />
            <SelectItem label="Lecturer Assignment" value="lecturers" />
          </SelectContent>
        </SelectPortal>
      </Select>
    </Box>
  );
}
