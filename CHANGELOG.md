# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2026-08-16

### Fixed

- **Android TV: infinite buffering on low-end SoCs.** The TV path used zero-copy
  `hwdec=mediacodec`, which binds MediaCodec directly to the display surface and
  wedges the mpv core on cheap TV SoCs (decoder "opens" but never emits frames —
  eternal buffering for all files). TV now uses `mediacodec-copy` like phones.
- **`http-header-fields` mangled and leaked between items.** The header list is an
  mpv string list: it must be comma-joined (the old `\r\n` join sent broken
  headers) and cleared before each load (headers set for one item were sent to
  the next one, leaking proxy credentials). Fixed on Android and iOS.
- **RTL subtitle punctuation placement.** Enabled `sub-vsfilter-bidi-compat`,
  applied `sub-ass-style-overrides` `Encoding=-1` for ASS/SSA tracks on selection,
  and mapped `setSubtitleAssOverride("no")` to `"scale"`. Android and iOS.
- **tvOS: silent audio with Atmos "Continuous Audio Output".** Some HDMI routes
  report 32 output channels that the audiounit AO cannot open; prefer
  `ao=avfoundation,audiounit` on tvOS (iOS unchanged).

### Added

- `nowPlayingMetadata.artworkHeaders`: custom proxy auth headers for fetching the
  Now Playing artwork (iOS).
- Web stubs for the module and view, so the package imports cleanly in Expo Web
  builds instead of crashing on the missing native module.

### Changed

- Android: the `nowPlayingMetadata` prop is typed loosely (`Map<String, Any?>`) so
  Expo accepts nested metadata values instead of rejecting the whole prop.
