import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

import { stageFor, Upload, UPLOAD_STAGES, useStore } from '@/lib/store';
import { colors, fonts, HIT, radius, space, type } from '@/lib/theme';

import { Moe } from './Moe';
import { Card, MosaicStrip, Skeleton } from './ui';

const MOE = 52;

/** Progress for one upload: Moe rolls along a track of tiles, coloring them in as he goes. */
export function UploadCard({ upload, paused }: { upload: Upload; paused?: boolean }) {
  const router = useRouter();
  const dismiss = useStore((s) => s.dismissUpload);
  const [track, setTrack] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const done = upload.status === 'done';
  // Once it has been read, name it as the policy it turned out to be.
  const policy = useStore((s) => s.policies.find((p) => p.id === upload.policyId));
  const stage = stageFor(upload.progress);
  const percent = Math.round(upload.progress * 100);

  useEffect(() => {
    Animated.timing(x, {
      toValue: upload.progress * Math.max(0, track - MOE),
      duration: 280,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [upload.progress, track, x]);

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={type.h3} accessibilityLiveRegion="polite">
            {done ? 'All rolled up!' : `${UPLOAD_STAGES[stage].label}…`}
          </Text>
          {done && policy ? (
            <>
              <Text style={[type.bodyInk, { marginTop: 2 }]} numberOfLines={2}>
                {policy.title}
              </Text>
              <Text style={type.small} numberOfLines={1}>
                {policy.carrier}
              </Text>
            </>
          ) : (
            <Text style={type.small} numberOfLines={1} ellipsizeMode="middle">
              {upload.fileName}
            </Text>
          )}
        </View>
        {done ? null : <Text style={styles.percent}>{percent}%</Text>}
      </View>

      <View
        style={styles.track}
        onLayout={(e) => setTrack(e.nativeEvent.layout.width)}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percent }}
      >
        <Animated.View style={{ width: MOE, height: MOE, transform: [{ translateX: x }] }}>
          <Moe size={MOE} mood={done ? 'happy' : 'rolling'} paused={paused} />
        </Animated.View>
        <MosaicStrip count={20} filled={upload.progress} size={12} gap={3} />
      </View>

      {done ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            dismiss(upload.id);
            if (upload.policyId) router.push(`/policy/${upload.policyId}`);
          }}
          style={styles.cta}
        >
          <Check size={18} color="#fff" strokeWidth={2.6} />
          <Text style={styles.ctaText}>See what Moe found</Text>
        </Pressable>
      ) : (
        <>
          <View style={styles.steps}>
            {UPLOAD_STAGES.map((s, i) => (
              <View key={s.label} style={styles.step}>
                <View style={[styles.dot, i < stage && styles.dotDone, i === stage && styles.dotNow]} />
                <Text style={[styles.stepText, i <= stage && { color: colors.ink }]}>{s.label}</Text>
              </View>
            ))}
          </View>
          {/* The policy card that's still being built */}
          <View style={styles.ghost}>
            <Skeleton width={44} height={44} style={{ borderRadius: 14 }} />
            <View style={{ flex: 1, gap: 8 }}>
              <Skeleton width="70%" height={14} />
              <Skeleton width="45%" />
            </View>
          </View>
          <Text style={[type.small, { marginTop: space.md }]}>You can keep using Mosey. I’ll badge Files when it’s ready.</Text>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: space.md, borderWidth: 2, borderColor: colors.plumSoft },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: HIT },
  percent: { fontFamily: fonts.display, fontSize: 22, lineHeight: 32, color: colors.plum },
  track: { marginTop: space.sm },
  steps: { marginTop: space.lg, gap: 8 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 3, backgroundColor: colors.sunken },
  dotDone: { backgroundColor: colors.teal },
  dotNow: { backgroundColor: colors.tangerine },
  stepText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: colors.muted },
  ghost: {
    marginTop: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  cta: {
    marginTop: space.lg,
    minHeight: 50,
    borderRadius: radius.pill,
    backgroundColor: colors.plum,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 22, color: '#fff' },
});
