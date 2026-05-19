import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/UI';
import { Colors, Fonts, Shadow } from '../theme';

const { width, height } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList>;

type ScanMode = 'camera' | 'result';

export const AIScannerScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [mode, setMode] = useState<ScanMode>('camera');
  const [scanning, setScanning] = useState(false);
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (scanning) {
      const scanLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      );
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      scanLoop.start();
      pulse.start();
      return () => { scanLoop.stop(); pulse.stop(); };
    }
  }, [scanning]);

  const handleCapture = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setMode('result');
    }, 2500);
  };

  const scanLineY = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 240] });

  if (mode === 'result') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#8B5CF6', '#A78BFA']}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => { setMode('camera'); }}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { marginLeft: 12, flex: 1 }]}>Scan Result</Text>
          <Badge label="AI Solved ✓" bgColor="rgba(255,255,255,0.25)" color={Colors.white} size="sm" />
        </LinearGradient>

        <View style={{ flex: 1, padding: 20 }}>
          {/* Scanned image placeholder */}
          <View style={styles.scannedImageBox}>
            <Ionicons name="image-outline" size={48} color={Colors.textLight} />
            <Text style={{ fontFamily: Fonts.regular, fontSize: 13, color: Colors.textLight, marginTop: 8 }}>Scanned Image</Text>
          </View>

          <Card style={{ marginTop: 16 }}>
            <View style={styles.resultHeader}>
              <View style={styles.aiIconBox}>
                <Ionicons name="sparkles" size={18} color={Colors.purple} />
              </View>
              <Text style={styles.resultTitle}>AI Answer</Text>
            </View>
            <Text style={styles.resultQuestion}>Solve: ∫ 2x dx</Text>
            <Text style={styles.resultAnswer}>
              {'Step 1: Apply the power rule\n∫ 2x dx = 2 · (x²/2) + C\n\nStep 2: Simplify\n= x² + C\n\n✅ Answer: x² + C'}
            </Text>

            <View style={styles.resultActions}>
              <Button title="Ask AI More" onPress={() => navigation.navigate('AskQuestion')} variant="outline" />
              <Button title="Save Answer" onPress={() => Alert.alert('Saved!', 'Answer saved to your library.')} />
            </View>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dark camera bg */}
      <View style={styles.cameraView}>
        {/* Top bar */}
        <View style={[styles.cameraHeader, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { flex: 1, marginLeft: 12 }]}>AI Scanner</Text>
          <TouchableOpacity style={styles.flashBtn}>
            <Ionicons name="flash-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Scan frame */}
        <View style={styles.scanFrame}>
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />

          {/* Corner markers */}
          {[
            { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
            { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
            { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
            { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
          ].map((corner, i) => (
            <View key={i} style={[styles.corner, corner]} />
          ))}
        </View>

        <Text style={styles.scanHint}>
          {scanning ? 'Analyzing... 🤖' : 'Point camera at a math problem,\ndiagram, or text to scan'}
        </Text>

        {/* Bottom controls */}
        <View style={[styles.cameraControls, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity style={styles.galleryBtn}>
            <Ionicons name="images-outline" size={24} color={Colors.white} />
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.captureBtn, scanning && styles.captureBtnActive]}
              onPress={handleCapture}
              disabled={scanning}
            >
              <LinearGradient
                colors={scanning ? ['#8B5CF6', '#A78BFA'] : ['#FF7A00', '#FF9A3C']}
                style={styles.captureGrad}
              >
                <Ionicons name={scanning ? 'hourglass-outline' : 'scan'} size={28} color={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity style={styles.galleryBtn} onPress={() => navigation.navigate('AskQuestion')}>
            <Ionicons name="chatbubble-outline" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  cameraView: { flex: 1, backgroundColor: '#111' },
  cameraHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
  flashBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  scanFrame: {
    width: width - 80,
    height: 260,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    position: 'relative',
  },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: Colors.primary },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: Colors.primary, opacity: 0.8 },
  scanHint: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 24, lineHeight: 22 },
  cameraControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40, marginTop: 'auto', paddingTop: 30 },
  galleryBtn: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  captureBtn: {},
  captureBtnActive: {},
  captureGrad: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  // Result styles
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  scannedImageBox: { height: 160, backgroundColor: Colors.white, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border, borderStyle: 'dashed' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  aiIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F3F0FF', alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.textDark },
  resultQuestion: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.primary, marginBottom: 14 },
  resultAnswer: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textDark, lineHeight: 24, backgroundColor: Colors.background, borderRadius: 12, padding: 14, marginBottom: 16 },
  resultActions: { flexDirection: 'row', gap: 12 },
});
