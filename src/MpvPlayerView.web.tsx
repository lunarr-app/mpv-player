import { forwardRef, useImperativeHandle } from "react";

import { MpvPlayerViewProps, MpvPlayerViewRef } from "./MpvPlayer.types";

/**
 * Web placeholder for the native MpvPlayer view. libmpv cannot run in the
 * browser, so playback is unsupported on web; this stub keeps the component
 * importable in Expo Web builds and exposes a no-op ref so consumers calling
 * player methods don't crash. Renders a clear placeholder instead of the
 * video surface.
 */
export default forwardRef<MpvPlayerViewRef, MpvPlayerViewProps>(
  function MpvPlayerView(_props, ref) {
    useImperativeHandle(ref, () => ({
      play: async () => {},
      pause: async () => {},
      destroy: async () => {},
      seekTo: async (_position: number) => {},
      seekBy: async (_offset: number) => {},
      setSpeed: async (_speed: number) => {},
      getSpeed: async () => 1,
      isPaused: async () => true,
      getCurrentPosition: async () => 0,
      getDuration: async () => 0,
      startPictureInPicture: async () => {},
      stopPictureInPicture: async () => {},
      isPictureInPictureSupported: async () => false,
      isPictureInPictureActive: async () => false,
      getSubtitleTracks: async () => [],
      setSubtitleTrack: async (_trackId: number) => {},
      disableSubtitles: async () => {},
      getCurrentSubtitleTrack: async () => 0,
      addSubtitleFile: async (_url: string, _select = true) => {},
      setSubtitlePosition: async (_position: number) => {},
      setSubtitleScale: async (_scale: number) => {},
      setSubtitleMarginY: async (_margin: number) => {},
      setSubtitleAlignX: async (_alignment: "left" | "center" | "right") => {},
      setSubtitleAlignY: async (_alignment: "top" | "center" | "bottom") => {},
      setSubtitleFontSize: async (_size: number) => {},
      setSubtitleBackgroundColor: async (_color: string) => {},
      setSubtitleBorderStyle: async (_style: "outline-and-shadow" | "background-box") => {},
      setSubtitleAssOverride: async (_mode: "no" | "force") => {},
      getAudioTracks: async () => [],
      setAudioTrack: async (_trackId: number) => {},
      getCurrentAudioTrack: async () => 0,
      setZoomedToFill: async (_zoomed: boolean) => {},
      isZoomedToFill: async () => false,
      getTechnicalInfo: async () => ({}),
    }));

    return (
      <div
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
          color: "#888",
          display: "flex",
          minHeight: 240,
          fontFamily: "system-ui, sans-serif",
          fontSize: 14,
        }}
      >
        Video playback is not supported on web (mpv is a native-only player).
      </div>
    );
  },
);