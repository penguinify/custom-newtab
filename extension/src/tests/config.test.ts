// Used to test migration of configuration files so I don't bomb users' real configs

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mergeUserConfig, defaultUserConfig, isUserConfig, saveUserConfig } from "../config";
import type { BackgroundType, UserConfig } from "../types";

describe("UserConfig merging", () => {
    it("returns default config if no old config", () => {
        const merged = mergeUserConfig(defaultUserConfig());
        expect(merged).toEqual(defaultUserConfig());
    });

    it("merges shallow fields from old config", () => {
        const oldConfig: Partial<UserConfig> = {
            tabTitle: "Custom Tab",
            fontFamily: "Arial"
        };
        const merged = mergeUserConfig(defaultUserConfig(), oldConfig);
        expect(merged.tabTitle).toBe("Custom Tab");
        expect(merged.fontFamily).toBe("Arial");
        expect(merged.background).toEqual(defaultUserConfig().background);
    });

    it("deep merges background of type 'color'", () => {
        const oldConfig: Partial<UserConfig> = {
            background: { type: "color", hex: "#123456" }
        };
        const merged = mergeUserConfig(defaultUserConfig(), oldConfig);
        expect(merged.background.type).toBe("color");
        expect((merged.background as Extract<BackgroundType, {type: "color"}>).hex).toBe("#123456");
    });

    it("deep merges background of type 'image'", () => {
        const oldConfig: Partial<UserConfig> = {
            background: { type: "image", url: "img.png", css: "background-size:cover;" }
        };
        const merged = mergeUserConfig(defaultUserConfig(), oldConfig);
        expect(merged.background.type).toBe("image");
        expect((merged.background as Extract<BackgroundType, {type: "image"}>).url).toBe("img.png");
        expect((merged.background as Extract<BackgroundType, {type: "image"}>).css).toBe("background-size:cover;");
    });

    it("deep merges background of type 'video'", () => {
        const oldConfig: Partial<UserConfig> = {
            background: { type: "video", fallbackColor: "#ff00ff" }
        };
        const merged = mergeUserConfig(defaultUserConfig(), oldConfig);
        expect(merged.background.type).toBe("video");
        expect((merged.background as Extract<BackgroundType, {type: "video"}>).fallbackColor).toBe("#ff00ff");
    });

    it("deep merges background of type 'customcss'", () => {
        const oldConfig: Partial<UserConfig> = {
            background: { type: "customcss", css: ".foo { color: red; }" }
        };
        const merged = mergeUserConfig(defaultUserConfig(), oldConfig);
        expect(merged.background.type).toBe("customcss");
        expect((merged.background as Extract<BackgroundType, {type: "customcss"}>).css).toBe(".foo { color: red; }");
    });

    it("deep merges colors", () => {
        const oldConfig: Partial<UserConfig> = {
            colors: { textColor: "#ABCDEF" }
        };
        const merged = mergeUserConfig(defaultUserConfig(), oldConfig);
        expect(merged.colors.textColor).toBe("#ABCDEF");
    });

    it("fills missing fields from default config", () => {
        const oldConfig: Partial<UserConfig> = {
            background: { type: "color", hex: "#222222" }
        };
        const merged = mergeUserConfig(defaultUserConfig(), oldConfig);
        expect(merged.tabTitle).toBe(defaultUserConfig().tabTitle);
        expect(merged.background.type).toBe("color");
        expect((merged.background as Extract<BackgroundType, {type: "color"}>).hex).toBe("#222222");
    });
});


