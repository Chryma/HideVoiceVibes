/**
 * @name HideVoiceVibes
 * @description Hides the images (vibes) people add to voice channels.
 * @version 2.0.0
 * @author Chase
 * @source https://github.com/Chryma/HideVoiceVibes
 * @website https://github.com/Chryma/HideVoiceVibes
 * @updateUrl https://raw.githubusercontent.com/Chryma/HideVoiceVibes/main/HideVoiceVibes.plugin.js
 */

// Discord gates vibes ("hangout windows") behind an experiment read via calls like
// (0,eM.Dm)({guildId, location:"HangoutWindow"}). Forcing enableHangoutWindow to false makes Discord
// render and size the channel list as if the feature didn't exist: no card, no gap, no scroll glitch.
// Minified names change between Discord builds, so they're found from the calling module's source.
const LOCATIONS = /\(0,(\w+)\.(\w+)\)\(\{guildId:[^{}]*location:"(?:HangoutWindow|ChannelList|VoiceChannelStatus)"/g;

function getRequire() {
    let req;
    webpackChunkdiscord_app.push([[Symbol()], {}, r => req = r]);
    webpackChunkdiscord_app.pop();
    return req;
}

module.exports = class HideVoiceVibes {
    start() {
        const req = getRequire();
        const src = Object.values(req.m).map(f => f.toString()).find(s => s.includes('location:"HangoutWindow"') && s.includes("enableHangoutWindow"));
        if (!src) return BdApi.UI.showToast("HideVoiceVibes: couldn't find the vibes code, Discord may have changed", { type: "error" });

        // The factory is (module, exports, require); only match imports made through its require param,
        // since minified aliases like eM get reused for unrelated calls elsewhere in the module.
        const requireName = src.match(/^[^(]*\(\s*\w+\s*,\s*\w+\s*,\s*(\w+)/)?.[1] ?? "n";
        const targets = new Map(); // module id -> set of hook names
        for (const [, alias, fn] of src.matchAll(LOCATIONS)) {
            const id = src.match(new RegExp(`[^\\w$.]${alias}=${requireName}\\((\\d+)\\)`))?.[1];
            if (id) targets.set(id, (targets.get(id) ?? new Set()).add(fn));
            else console.error("HideVoiceVibes: no import found for", alias, fn);
        }

        let patched = 0;
        for (const [id, fns] of targets) {
            // Look the module up through BetterDiscord: the require from the chunk-push trick can belong to a
            // different webpack runtime that doesn't hold this module.
            const exports = BdApi.Webpack.getModule((_, m, mid) => String(mid ?? m?.id) === id);
            if (!exports) { console.error("HideVoiceVibes: module not loaded", id); continue; }
            for (const fn of fns) {
                try {
                    BdApi.Patcher.after("HideVoiceVibes", exports, fn, (_, __, ret) =>
                        ret && typeof ret === "object" ? { ...ret, enableHangoutWindow: false } : ret);
                    patched++;
                } catch (e) {
                    console.error("HideVoiceVibes: failed to patch", id, fn, e);
                }
            }
        }
        if (!patched) BdApi.UI.showToast("HideVoiceVibes: nothing patched, Discord may have changed", { type: "error" });
    }

    stop() {
        BdApi.Patcher.unpatchAll("HideVoiceVibes");
    }
};
