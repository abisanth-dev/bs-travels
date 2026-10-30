#!/usr/bin/env bash
# Encode a supplied clip for the destination journey and write its poster.
# Usage: scripts/add-journey-video.sh <input video> <stop slug, e.g. india>
# Then add the slug to src/content/journeyVideos.ts.
set -euo pipefail
in="$1"
slug="$2"
out="public/videos/journey"
mkdir -p "$out"
# Silent, web-friendly H.264, at most 1920 wide, starts playing before it finishes loading.
ffmpeg -y -loglevel error -i "$in" -an -t 10 -vf "scale='min(1920,iw)':-2,fps=30" \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart "$out/$slug.mp4"
ffmpeg -y -loglevel error -ss 1 -i "$out/$slug.mp4" -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -quality 78 "$out/$slug.webp"
ls -lh "$out/$slug.mp4" "$out/$slug.webp"
