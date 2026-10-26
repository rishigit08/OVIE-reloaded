import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { useCallback, useState } from 'react';
import { Image, Platform, View } from 'react-native';

import { PolicyType } from '@/lib/data';
import { colors } from '@/lib/theme';

import { GLScene, SceneSetup } from './GLScene';
import { buildPolicyModel, TILE_TINT } from './policyModels';

// Stills are rendered once per type and size, then reused as plain images so a
// long list of policies doesn't hold a GL context per row.
const stills = new Map<string, string>();

/** How far the model is allowed to poke out past its tile. */
const OVERHANG = 1.3;

export type PolicyTileProps = {
  type: PolicyType;
  size?: number;
  /** Greyed out, for expired policies. */
  dim?: boolean;
  /** Keep the model gently turning instead of rendering a still. */
  live?: boolean;
  paused?: boolean;
};

/**
 * The 3D model for a kind of policy, sitting on a soft tile.
 * Not in use: the app shows flat icons instead (see PolicyTile.tsx, which has
 * a one-line switch to bring these back).
 */
export function PolicyTile3D({ type, size = 48, dim = false, live = false, paused = false }: PolicyTileProps) {
  const key = `${type}@${size}`;
  const [still, setStill] = useState(stills.get(key));
  const canvas = Math.round(size * OVERHANG);

  const setup = useCallback<SceneSetup>(
    (scene, camera) => {
      const model = buildPolicyModel(type);
      scene.add(model);
      camera.position.z = 5.6;
      if (!live) return;
      const turn = model.rotation.y;
      return (t) => {
        model.rotation.y = turn + Math.sin(t * 0.9) * 0.55;
        model.position.y = Math.sin(t * 1.7) * 0.06;
      };
    },
    [type, live],
  );

  const onStill = useCallback(
    async (gl: ExpoWebGLRenderingContext) => {
      if (Platform.OS === 'web') return; // the canvas itself is cheap enough there
      try {
        const shot = await GLView.takeSnapshotAsync(gl, { format: 'png' });
        if (typeof shot.uri !== 'string') return;
        stills.set(key, shot.uri);
        setStill(shot.uri);
      } catch {
        // Keep showing the live canvas.
      }
    },
    [key],
  );

  const offset = (size - canvas) / 2;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: dim ? colors.sunken : TILE_TINT[type],
      }}
    >
      <View style={{ position: 'absolute', left: offset, top: offset, opacity: dim ? 0.45 : 1 }}>
        {still && !live ? (
          <Image source={{ uri: still }} style={{ width: canvas, height: canvas }} />
        ) : (
          <GLScene size={canvas} setup={setup} animate={live} paused={paused} onStill={live ? undefined : onStill} />
        )}
      </View>
    </View>
  );
}
