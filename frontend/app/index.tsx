import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/authStore';

// This is the app entry point. It redirects at render-time
// using <Redirect /> — never imperative router.replace() in useEffect.
export default function Index() {
  const { session, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)" />;
  }

  if (user?.role === 'ADMIN') {
    return <Redirect href="/(app)/admin" />;
  }

  if (user?.role === 'TEACHER') {
    return <Redirect href="/(app)/teacher" />;
  }

  // Default: student (also covers when role not yet fetched but session exists)
  return <Redirect href="/(app)/student" />;
}
