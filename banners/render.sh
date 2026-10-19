#!/bin/sh
# Renders every banner at 2x with Playwright's headless Chromium shell (set CHROME to use another).
set -e
cd "$(dirname "$0")"
B="${CHROME:-$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell}"
shot() { # kind theme w h
  "$B" --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --force-device-scale-factor=2 --default-background-color=00000000 \
    --window-size="$3,$4" --virtual-time-budget=3000 \
    --screenshot="$PWD/$1-$2.png" "file://$PWD/banner.html?kind=$1&theme=$2" 2>/dev/null
}
for t in dark light; do
  shot gh "$t" 1280 400
  shot li "$t" 1584 396
done
ls -la *.png

# The README's contact section: two cards per theme, and theme-free dock tiles.
mkdir -p contact
(cd .. && bun banners/boxes.ts proton-mail.svg fantastical.webp ../favicon.svg linkedin.svg bluesky.svg discord.svg underscore-games.svg ko-fi.svg)
cshot() { # out query w h
  "$B" --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --force-device-scale-factor=2 --default-background-color=00000000 \
    --window-size="$3,$4" --virtual-time-budget=3000 \
    --screenshot="$PWD/contact/$1.png" "file://$PWD/contact.html?$2" 2>/dev/null
}
for t in dark light; do
  for c in email call; do cshot "$c-$t" "kind=card&id=$c&theme=$t" 404 96; done
done
for i in site linkedin bluesky discord underscore kofi; do cshot "$i" "kind=icon&id=$i" 88 96; done
