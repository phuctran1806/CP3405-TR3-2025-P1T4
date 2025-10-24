import { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { z } from 'zod';
import LoginForm from './components/LoginForm';
import AuthFooter from './components/AuthFooter';
import LogoPlaceholder from '@/components/containers/LogoPlaceholder';
import { login } from '@/api/auth';

// 1️⃣ Zod schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      // Map validation errors
      for (const issue of result.error.issues) {
        if (issue.path[0] === 'email') setEmailError(issue.message);
        if (issue.path[0] === 'password') setPasswordError(issue.message);
      }
      setLoading(false);
      return;
    }

    try {
      const result = await login({ 'username': email, 'password': password });
      if (!result.ok) throw result.error;
      router.replace('/(main)/home');
    } catch (e: any) {
      if (e.status === 401) setGeneralError("Incorrect username or password");
      else setGeneralError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LogoPlaceholder />
        <LoginForm
          email={email}
          password={password}
          rememberMe={rememberMe}
          emailError={emailError}
          passwordError={passwordError}
          generalError={generalError}
          loading={loading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onRememberMeToggle={() => setRememberMe(!rememberMe)}
          onLogin={handleLogin}
          onForgotPassword={() => console.log('Forgot password')}
          onSignUp={() => router.replace('/register')}
          onSocialLogin={(provider) => console.log(`${provider} login pressed`)}
        />
        <AuthFooter onGuestLogin={() => router.replace('/(main)/home')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A2942'
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
});

export default LoginScreen;

