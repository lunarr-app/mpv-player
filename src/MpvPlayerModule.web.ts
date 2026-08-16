import { NativeModule, registerWebModule } from "expo";

/**
 * Web placeholder for the native MpvPlayer module. There is no mpv/libmpv
 * runtime on web, so this exists only to keep `@lunarr/mpv-player` importable
 * in Expo Web builds (the native module would otherwise throw at import).
 */
class MpvPlayerModule extends NativeModule<Record<string, never>> {
  /**
   * Web has no native decode path (no mpv, no VideoToolbox/MediaCodec), so
   * report no hardware AV1 support — callers should transcode.
   */
  supportsAv1HardwareDecode(): boolean {
    return false;
  }
}

// Registered under the same name as the native module so `requireNativeModule`
// lookups behave consistently across platforms.
export default registerWebModule(MpvPlayerModule, "MpvPlayer");