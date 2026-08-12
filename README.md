# @lunarr/mpv-player

mpv-based video player for React Native / Expo apps (originally built for the
Lunarr client apps). A custom Expo module (`expo-modules-core`) that wraps
libmpv via MPVKit (iOS/tvOS) and `dev.jdtech.mpv` (Android) to give mobile and
TV a single, high-codec player with direct-play support.

| Platform | Engine | Video Output |
| --- | --- | --- |
| iOS | MPVKit (libmpv, LGPL build) | `vo_avfoundation` (AVSampleBufferDisplayLayer) |
| tvOS | MPVKit (libmpv) | `vo_avfoundation` + HDR display criteria |
| Android | `dev.jdtech.mpv` (libmpv) | `gpu-next` / `mediacodec` |

## Features

- Wide codec support (HEVC, AV1, VP9, MKV, and more) via libmpv/FFmpeg.
- Direct-play: advertises all-codec native playback so the backend sends
  `mode: "direct"`.
- Picture-in-Picture on **iOS/Android mobile only** (tvOS has none).
- Contain / cover content-fit only.
- Subtitle track control, audio track control, external subtitle files.
- Audio enhancements: mono downmix, dialogue boost, volume boost, and
  audio/subtitle delay.

## Installation

Install the package and its config plugin:

```sh
npm install @lunarr/mpv-player
# or
yarn add @lunarr/mpv-player
# or
pnpm add @lunarr/mpv-player
```

### Config plugin (`app.json`)

Add the module to Expo's `plugins` array. It:

- Pins the Android NDK version required by libmpv.
- Adds the `MPVKit` CocoaPod to your Podfile (iOS/tvOS).
- Optionally enables the iOS `audio` background mode that Picture-in-Picture
  requires.

```json
{
  "expo": {
    "plugins": [
      "@lunarr/mpv-player"
    ]
  }
}
```

To register a custom MPVKit podspec URL, or to **disable Picture-in-Picture**
(required on tvOS, which has none), pass options:

```json
{
  "expo": {
    "plugins": [
      [
        "@lunarr/mpv-player",
        {
          "enablePictureInPicture": false
        }
      ]
    ]
  }
}
```

> After changing the plugin, rebuild with `npx expo run:ios` / `run:android`
> (or `expo prebuild`) so the native pods/Gradle changes take effect.

## Usage

The module exposes the mpv player as a native view you embed in your React
Native / Expo app, plus an imperative API through a ref.

```tsx
import { useEffect, useRef, useState } from "react";
import { View, Button } from "react-native";
import {
  MpvPlayerView,
  type MpvPlayerViewRef,
  type OnProgressEventPayload,
} from "@lunarr/mpv-player";

export default function VideoPlayer({ url }: { url: string }) {
  const playerRef = useRef<MpvPlayerViewRef>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Release the mpv instance + decoder buffers before leaving the screen.
  useEffect(() => {
    return () => {
      void playerRef.current?.destroy();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      void playerRef.current?.pause();
    } else {
      void playerRef.current?.play();
    }
    setIsPlaying((value) => !value);
  };

  return (
    <View style={{ flex: 1 }}>
      <MpvPlayerView
        ref={playerRef}
        style={{ flex: 1 }}
        source={{
          url,
          startPosition: 0,
          autoplay: true,
          headers: { Authorization: "Bearer token" },
        }}
        nowPlayingMetadata={{
          title: "My Video",
          artworkUri: "https://example.com/poster.jpg",
        }}
        onProgress={({ nativeEvent }: { nativeEvent: OnProgressEventPayload }) => {
          setPosition(nativeEvent.position);
          setDuration(nativeEvent.duration);
        }}
        onPlaybackStateChange={({ nativeEvent }) => {
          // nativeEvent.isPaused / isPlaying / isLoading / isReadyToSeek
        }}
        onError={({ nativeEvent }) => {
          console.warn("mpv error:", nativeEvent.error);
        }}
        onEnd={() => {
          setIsPlaying(false);
        }}
      />
      <View style={{ flexDirection: "row", gap: 12, padding: 12 }}>
        <Button title={isPlaying ? "Pause" : "Play"} onPress={togglePlay} />
        <Button
          title="Skip +10s"
          onPress={() => void playerRef.current?.seekBy(10)}
        />
        <Button
          title="Seek to start"
          onPress={() => void playerRef.current?.seekTo(0)}
        />
        <Button
          title="2x"
          onPress={() => void playerRef.current?.setSpeed(2)}
        />
        <Button
          title={position + "/" + duration}
          disabled
        />
      </View>
    </View>
  );
}
```

### Imperative controls (`MpvPlayerViewRef`)

All methods return Promises and are safe to call at any time.

| Category | Methods |
| --- | --- |
| Playback | `play()`, `pause()`, `seekTo(seconds)`, `seekBy(offsetSeconds)`, `setSpeed(n)` / `getSpeed()`, `destroy()` |
| State | `isPaused()`, `getCurrentPosition()`, `getDuration()` |
| Subtitles | `getSubtitleTracks()` → `SubtitleTrack[]`, `setSubtitleTrack(id)`, `disableSubtitles()`, `getCurrentSubtitleTrack()`, `addSubtitleFile(url, select?)` |
| Subtitle layout | `setSubtitlePosition(n)`, `setSubtitleScale(n)`, `setSubtitleMarginY(n)`, `setSubtitleAlignX("left"\|"center"\|"right")`, `setSubtitleAlignY("top"\|"center"\|"bottom")`, `setSubtitleFontSize(n)`, `setSubtitleBackgroundColor(color)`, `setSubtitleBorderStyle("outline-and-shadow"\|"background-box")`, `setSubtitleAssOverride("no"\|"force")` |
| Audio | `getAudioTracks()` → `AudioTrack[]`, `setAudioTrack(id)`, `getCurrentAudioTrack()` |
| Picture-in-Picture | `startPictureInPicture()`, `stopPictureInPicture()`, `isPictureInPictureSupported()`, `isPictureInPictureActive()` |
| Scaling | `setZoomedToFill(zoomed)`, `isZoomedToFill()` |
| Diagnostics | `getTechnicalInfo()` → `TechnicalInfo` |

The full `VideoSource`, `SubtitleTrack`, `AudioTrack`, `TechnicalInfo`, and
event payload types are defined in `src/MpvPlayer.types.ts`.

### Events

- `onLoad` — fired when the source starts loading.
- `onPlaybackStateChange` — playback/paused/loading/seek-ready updates.
- `onProgress` — periodic `{ position, duration, progress, cacheSeconds }`.
- `onTracksReady` — fired when subtitle/audio track metadata is available.
- `onError` — `{ error }` on a decode/playback failure.
- `onEnd` — fired on unambiguous end-of-file.
- `onPictureInPictureChange` — `{ isActive }` when PiP enters/exits.

## Attribution

The native player code in `ios/` and `android/` is adapted from
**Streamyfin** (MPL-2.0), a
Jellyfin client whose `mpv-player` Expo module this package is derived from.
Thanks to the Streamyfin maintainers for releasing their mpv integration under
the Mozilla Public License 2.0.

Changes made on top of the upstream module for Lunarr:

- Removed the presented full-screen native player, keeping the RN-embedded
  `MpvPlayerView` as the single player surface.
- Replaced `expo-video` with this module in both the mobile and TV apps.
- Added a native `onEnd` event (iOS `MPV_END_FILE_REASON_EOF`, Android via
  the `eof-reached` property) for unambiguous end-of-file detection.
- Hardened the iOS renderer (serial mpv work queue, decoder-failure
  auto-recovery, seek throttling guards) and the Android renderer
  (thread-safety, EOF handling).
- Removed the unused Expo template boilerplate (`hello`, `setValueAsync`).

## License

Licensed under the **Mozilla Public License 2.0** (MPL-2.0), matching the
upstream Streamyfin code it is derived from. See the repo root `LICENSE` for
the full text.
