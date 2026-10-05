# Doggy Player v1.1.75

Seeking now behaves like VLC: the jump is instant, with no audio/video
"vibration" at the start of a seek.

* **No more stutter at the start of a seek.** The player called `play()` as soon
  as it knew the track layout, before a single frame or audio sample existed.
  Chromium then fired `play` -> `waiting` on every source swap, which is the
  stall heard and seen right after each jump. Playback now starts when there
  really is data, and for re-encoded streams only once the element can keep
  playing.
* **Audio starts with the picture.** The re-encode pipe asked FFmpeg for
  `-tune zerolatency` plus a zeroed interleave window, which pushed the first
  audio packet about 0.4 s further into the stream: the picture started alone
  and the sound caught up (the "vibration"). The first-audio offset dropped from
  30 739 bytes / packet #20 to 21 045 bytes / packet #14.
* **Seeking becomes native.** Files whose video codec Chromium cannot decode
  (H.263, MPEG-4, MJPEG, WMV, ProRes, ...) are re-encoded once in the background
  to a dense-keyframe H.264/AAC MP4 and cached; the player then switches to that
  copy, so a seek no longer has to tear down and rebuild the streaming pipe. An
  already cached copy is now adopted immediately on the next play, and the swap
  never happens in the middle of a seek.
* **Exact seek positions.** A pipe restart used to be rounded down to whole
  seconds, which left the playhead up to 1 s away from the picture and made the
  next relative seek start from the wrong place. It is now millisecond exact.
* Also fixed: a source swap pauses the element on its own, and that pause could
  clear the play state and silence a running video a few seconds later.

Measured on H.263 + AMR clips: on first play (through the re-encode pipe)
157-214 ms to a running picture with zero `waiting` events and audio already
decoded; on the cached copy 46-104 ms with no source reload. All 38 samples in
the format self-test play with picture and audio.

## Upgrade

Existing Doggy Player installations will receive v1.1.75 automatically via the
built-in updater after the release assets have finished building and publishing.
