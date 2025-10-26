import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';

export type Role = 'student' | 'lecturer' | 'admin';

interface RoleToggleProps {
  selectedRole: Role;
  onSelect: (role: Role) => void;
}

const roles: { key: Role; label: string }[] = [
  { key: 'student', label: 'Student' },
  { key: 'lecturer', label: 'Lecturer' },
  { key: 'admin', label: 'Admin' },
];

const roleIcons = {
  student: require('assets/roles/student.png'),
  lecturer: require('assets/roles/lecturer.png'),
  admin: require('assets/roles/admin.png'),
};

const RoleToggle: React.FC<RoleToggleProps> = ({ selectedRole, onSelect }) => {
  return (
    <View style={styles.container}>
      {roles.map((role) => (
        <TouchableOpacity
          key={role.key}
          onPress={() => onSelect(role.key)}
          style={[
            styles.button,
            selectedRole === role.key && styles.buttonSelected,
          ]}
        >
          <View style={styles.icon}>
            <Image source={roleIcons[role.key]} style={styles.iconImage} />
          </View>
          <Text style={[styles.label, selectedRole === role.key && styles.labelSelected]}>
            {role.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 24,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: 'transparent',
    flex: 1,
    marginHorizontal: 4,
  },
  buttonSelected: {
    backgroundColor: '#3b82f6',
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginBottom: 6,
  },
  iconImage: {
    width: '95%',
    height: '95%',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  label: {
    color: '#fff',
    fontWeight: '500',
  },
  labelSelected: {
    color: '#fff',
  },
});

export default RoleToggle;
