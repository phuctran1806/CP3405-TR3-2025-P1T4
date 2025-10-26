import { useState } from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import LoginForm from './components/LoginForm';
import AuthFooter from './components/AuthFooter';
import RoleToggle from './components/RoleToggle';
import LogoPlaceholder from '@/components/containers/LogoPlaceholder';
import { useRouter } from 'expo-router';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState<'student' | 'lecturer' | 'admin'>('student');
  const router = useRouter();

  // TODO: call the apis here
  const handleLogin = () => {
    console.log('Login pressed', { email, password, rememberMe, role });
    setTimeout(() => {
      router.replace(`/(main)/home?role=${role}`);
    }, 1000);
  };

  const handleForgotPassword = () => {
    console.log('Forgot password pressed');
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} login pressed`);
  };

  const handleSignUp = () => {
    console.log('Sign up pressed');
  };

  const handleGuestLogin = () => {
    setTimeout(() => {
      router.replace('/(main)/home');
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LogoPlaceholder />

        <LoginForm
          email={email}
          password={password}
          rememberMe={rememberMe}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onRememberMeToggle={() => setRememberMe(!rememberMe)}
          onLogin={handleLogin}
          onForgotPassword={handleForgotPassword}
          onSignUp={handleSignUp}
          onSocialLogin={handleSocialLogin}
        />

        <RoleToggle selectedRole={role} onSelect={setRole} />

        <AuthFooter onGuestLogin={handleGuestLogin} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2942',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
});

export default LoginScreen;
export { default as LoginScreen } from "./LoginScreen";
export { default as SignupScreen } from "./SignupScreen";
