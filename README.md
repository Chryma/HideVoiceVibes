# HideVoiceVibes

A BetterDiscord plugin that hides the images ("vibes") people set on voice channels.

Instead of covering the image with CSS, it switches Discord's vibes feature off on your client, so the channel list
lays out as if vibes didn't exist: no image, no blank gap, no scrolling glitches. Voice channel text statuses still show.

## Install

1. Download [`HideVoiceVibes.plugin.js`](https://raw.githubusercontent.com/Chryma/HideVoiceVibes/main/HideVoiceVibes.plugin.js) (right-click → Save link as).
2. Put it in your BetterDiscord plugins folder (Settings → Plugins → Open Plugins Folder).
3. Enable **HideVoiceVibes** and press Ctrl+R.

## If it stops working

Discord updates can change the code this plugin hooks into. If you see a "nothing patched" or "couldn't find the vibes code"
toast, open an issue with any red `HideVoiceVibes` lines from the console (Ctrl+Shift+I → Console).

Only affects what you see. Other people still see vibes, and you can still set one yourself from another client.
