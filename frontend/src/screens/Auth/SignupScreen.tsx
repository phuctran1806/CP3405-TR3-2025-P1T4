import React, { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import RoleToggle, {type Role} from './components/RoleToggle';
import SignupForm from './components/SignupForm';
import { spacing } from '@/constants/spacing';
import { useRouter } from 'expo-router';
import { signup } from '@/api/auth';
import type { SignupParams } from '@/api/auth';
import LogoPlaceholder from '@/components/containers/LogoPlaceholder';
import { z } from 'zod';
import { colors } from '@/constants/colors';

const SignupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone_number: z.string().min(5, 'Invalid phone number'),
  role: z.enum(['student', 'lecturer', 'admin']),
  password: z.string().min(10, 'Password must be at least 10 characters'),
  student_id: z.string().optional(),
});

const SignupScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSignup = async () => {
    setErrors({});
    const payload: SignupParams = { email, name, phone_number: phoneNumber, role, password, ...(role === 'student' ? { student_id: studentId } : {}) };

    const validation = SignupSchema.safeParse(payload);
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((e) => {
        if (e.path[0]) newErrors[e.path[0].toString()] = e.message;
      });
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await signup(payload);
      if (!res.ok) {
        setErrors({ api: res.error.message });
        return;
      }
      router.replace(`/(main)/home?role=${role}`);
    } catch (e: any) {
      setErrors({ api: e.message || 'Signup failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    router.replace('/login');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <LogoPlaceholder />
        <SignupForm
          email={email}
          name={name}
          phoneNumber={phoneNumber}
          role={role}
          password={password}
          studentId={studentId}
          onEmailChange={setEmail}
          onNameChange={setName}
          onPhoneNumberChange={setPhoneNumber}
          onRoleChange={setRole}
          onPasswordChange={setPassword}
          onStudentIdChange={setStudentId}
          onSignup={handleSignup}
          onSignIn={handleSignIn}
          emailError={errors.email}
          nameError={errors.name}
          phoneError={errors.phone_number}
          passwordError={errors.password}
          studentIdError={errors.student_id}
          loading={loading}
        />
        {errors.api && <Text style={{ color: colors.red500, textAlign: 'center', marginTop: 8 }}>{errors.api}</Text>}

        <RoleToggle selectedRole={role} onSelect={setRole} />

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A2942' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
});

export default SignupScreen;

