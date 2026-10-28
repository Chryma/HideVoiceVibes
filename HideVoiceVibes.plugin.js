/**
 * @name HideVoiceVibes
 * @description Hides the images (vibes) people add to voice channels.
 * @version 2.1.0
 * @author Chase
 * @source https://github.com/Chryma/HideVoiceVibes
 * @website https://github.com/Chryma/HideVoiceVibes
 * @updateUrl https://raw.githubusercontent.com/Chryma/HideVoiceVibes/main/HideVoiceVibes.plugin.js
 */

// Discord gates vibes ("hangout windows") behind the guild experiment "2026-02_hangout_window".
// Forcing enableHangoutWindow to false on the experiment object itself makes Discord render and size the
// channel list as if the feature didn't exist: no card, no gap, no scroll glitch. Every caller (hooks,
// getCurrentConfig, new call sites in lazy chunks) reads through this one object, so patching it here
// survives Discord moving the call sites around between builds.
const EXPERIMENT_ID = "2026-02_hangout_window";
const off = (_, __, ret) => ret && typeof ret === "object" ? { ...ret, enableHangoutWindow: false } : ret;

module.exports = class HideVoiceVibes {
    start() {
        const mod = BdApi.Webpack.getBySource(EXPERIMENT_ID);
        const experiment = mod && Object.values(mod).find(v => v && typeof v.useExperiment === "function" && typeof v.getCurrentConfig === "function");
        if (!experiment) return BdApi.UI.showToast("HideVoiceVibes: couldn't find the vibes experiment, Discord may have changed", { type: "error" });

        BdApi.Patcher.after("HideVoiceVibes", experiment, "useExperiment", off);
        BdApi.Patcher.after("HideVoiceVibes", experiment, "getCurrentConfig", off);
    }

    stop() {
        BdApi.Patcher.unpatchAll("HideVoiceVibes");
    }
};
