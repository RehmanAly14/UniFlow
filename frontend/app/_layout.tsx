import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Root layout ONLY renders Slot. Never navigate here.
// Auth redirection is handled by app/index.tsx using <Redirect />.
export default function RootLayout() {
  return (
    <>
      <Slot />
      <StatusBar style="auto" />
    </>
  );
}
