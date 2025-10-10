import { useState } from 'react';
import { 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import LoginForm from './components/LoginForm';
import SocialButtons from './components/SocialButtons';
import AuthFooter from './components/AuthFooter';
import LogoPlaceholder from '@/components/LogoPlaceholder';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // TODO: call the apis here
  const handleLogin = () => {
    console.log('Login pressed', { email, password, rememberMe });
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
    console.log('Guest login pressed');
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
        />

        <SocialButtons onSocialLogin={handleSocialLogin} />

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
