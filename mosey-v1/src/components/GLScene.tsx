import { ExpoWebGLRenderingContext, GLView } from 'expo-gl';
import { useCallback, useEffect, useRef } from 'react';
import { Platform, StyleProp, View, ViewStyle } from 'react-native';
import * as THREE from 'three';

export type FrameFn = (t: number, dt: number) => void;
/** Build the scene once; optionally return a per-frame update. */
export type SceneSetup = (scene: THREE.Scene, camera: THREE.PerspectiveCamera) => FrameFn | void;

type Props = {
  size: number;
  setup: SceneSetup;
  /** false renders a still: a couple of frames, then the loop stops. */
  animate?: boolean;
  paused?: boolean;
  /** Called once a still has been drawn (only when `animate` is false). */
  onStill?: (gl: ExpoWebGLRenderingContext) => void;
  style?: StyleProp<ViewStyle>;
};

/** A small transparent three.js canvas that works on iOS, Android and web. */
export function GLScene({ size, setup, animate = true, paused = false, onStill, style }: Props) {
  const pausedRef = useRef(paused);
  const frame = useRef<number | null>(null);
  const loopRef = useRef<(() => void) | null>(null);
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
    if (!paused && frame.current === null && loopRef.current) {
      frame.current = requestAnimationFrame(loopRef.current);
    }
  }, [paused]);

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      loopRef.current = null;
      cleanup.current?.();
    },
    [],
  );

  const onContextCreate = useCallback((gl: ExpoWebGLRenderingContext) => {
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    // three wants a canvas; on native there isn't one, so hand it a stand-in.
    const canvas = (gl as any).canvas ?? {
      width,
      height,
      clientWidth: width,
      clientHeight: height,
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {},
    };

    // expo-gl's native WebGL2 context also passes `instanceof WebGLRenderingContext`,
    // which three reads as "WebGL 1" and refuses. Hide the global while it checks.
    const g = globalThis as any;
    const webgl1 = g.WebGLRenderingContext;
    if (Platform.OS !== 'web') g.WebGLRenderingContext = undefined;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, context: gl as any, antialias: true, alpha: true });
    } finally {
      g.WebGLRenderingContext = webgl1;
    }
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50);
    camera.position.set(0, 0, 5.7);
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(2.5, 3.5, 4);
    scene.add(key);

    // Errors thrown in here are otherwise swallowed by the native GL callback.
    let update: FrameFn | void;
    try {
      update = setup(scene, camera);
    } catch (e) {
      console.error('GLScene setup failed', e);
      return;
    }

    let t = 0;
    let last = Date.now();
    let drawn = 0;
    const loop = () => {
      if (pausedRef.current) {
        frame.current = null;
        return;
      }
      const now = Date.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      try {
        update?.(t, dt);
        renderer.render(scene, camera);
        gl.endFrameEXP?.();
      } catch (e) {
        console.error('GLScene frame failed', e);
        frame.current = null;
        loopRef.current = null;
        return;
      }
      drawn += 1;
      if (!animate && drawn >= 2) {
        frame.current = null;
        loopRef.current = null;
        onStill?.(gl);
        return;
      }
      frame.current = requestAnimationFrame(loop);
    };

    loopRef.current = loop;
    cleanup.current = () => renderer.dispose();
    frame.current = requestAnimationFrame(loop);
    // Set up once per context; props are read through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <GLView style={{ flex: 1, backgroundColor: 'transparent' }} onContextCreate={onContextCreate} />
    </View>
  );
}
