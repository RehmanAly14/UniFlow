import { Stack } from 'expo-router';

// This layout simply wraps the entire authenticated app.
// Expo Router auto-discovers routes; we don't need to declare each screen.
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
