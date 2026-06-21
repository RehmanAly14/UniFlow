import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#EEF2FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.content}>
          {/* Top decorative elements */}
          <View style={styles.topDecorations} pointerEvents="none">
            <View style={styles.decoCircle1} />
            <View style={styles.decoCircle2} />
            <View style={styles.decoCircle3} />
          </View>

          {/* Main Illustration/Logo */}
          <View style={styles.imageContainer}>
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoWrapper}
            >
              <View style={styles.logoInner}>
                <Ionicons name="school-outline" size={56} color="#FFFFFF" />
              </View>
            </LinearGradient>
            
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>UniFlow</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaText}>v2.0</Text>
              </View>
            </View>

            <View style={styles.featurePills}>
              {['📚 Academics', '🎯 GPA', '📊 Timetable', '🤖 AI'].map((feature, index) => (
                <View key={index} style={styles.pill}>
                  <Text style={styles.pillText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Smart Campus Companion</Text>
            <Text style={styles.subtitle}>
              Manage your timetable, check your GPA, and access study resources all in one place with AI-powered assistance.
            </Text>

            <View style={styles.featuresRow}>
              <View style={styles.featurePoint}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.featurePointText}>Free to use</Text>
              </View>
              <View style={styles.featurePoint}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.featurePointText}>24/7 AI support</Text>
              </View>
              <View style={styles.featurePoint}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
                <Text style={styles.featurePointText}>Real-time updates</Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/signup')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryGradient}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
              <Ionicons name="chevron-forward" size={16} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>By continuing, you agree to our</Text>
            <View style={styles.footerLinks}>
              <Text style={styles.footerLink}>Terms of Service</Text>
              <Text style={styles.footerDot}>•</Text>
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  gradientBackground: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topDecorations: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(79, 70, 229, 0.04)',
    top: -50,
    right: -50,
  },
  decoCircle2: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(124, 58, 237, 0.04)',
    top: 30,
    right: 50,
  },
  decoCircle3: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(79, 70, 229, 0.02)',
    bottom: 240,
    left: -20,
  },
  imageContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoWrapper: {
    width: 108,
    height: 108,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  logoInner: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 10,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  betaBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  betaText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 12,
  },
  pill: {
    backgroundColor: 'rgba(79, 70, 229, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 229, 0.08)',
  },
  pillText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  textContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    textAlign: 'center',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  featurePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featurePointText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 4,
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  footerLink: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  footerDot: {
    fontSize: 11,
    color: '#CBD5E1',
  },
});