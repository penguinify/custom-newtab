import { UserConfig } from "./types"

export function defaultUserConfig(): UserConfig {
    return {
        background: {
            type: "color",
            hex: "#000000"
        },
        colors: {
            textColor: "#FFFFFF"
        }

    }
}

export function isUserConfig(obj: any): obj is UserConfig {
    return obj &&
        typeof obj === "object" &&
        "background" in obj &&
        "colors" in obj;
}

export function saveUserConfig(user_config: UserConfig): void {
    if (!chrome.storage || !chrome.storage.sync) {
        console.warn("Chrome storage not available, saving user config locally.");
        localStorage.setItem("user_config", JSON.stringify(user_config));
        return;
    }

    chrome.storage.sync.set({ user_config: user_config }, () => {
        console.info("User config saved!")
    });
}

export async function getUserConfig(): Promise<UserConfig> {
    if (!chrome.storage || !chrome.storage.sync) {
        console.warn("Chrome storage not available, loading user config locally.");
        return getLocalUserConfig();
    }


    let user_config = await chrome.storage.sync.get("user_config");
    console.log(isUserConfig(user_config.user_config));
    if (user_config.user_config && isUserConfig(user_config.user_config)) {
        return user_config.user_config as UserConfig;
    } else {
        const default_config = defaultUserConfig();
        // merge with any existing partial config
        const merged_config = { ...default_config, ...user_config.user_config as Partial<UserConfig> };
        chrome.storage.sync.set({ user_config: merged_config }, () => {
            console.info("Default user config saved to Chrome storage.");
        });
        return default_config;
    }
}

async function getLocalUserConfig(): Promise<UserConfig> {
    const user_config = localStorage.getItem("user_config");
    if (!user_config) {
        const default_config = defaultUserConfig();
        localStorage.setItem("user_config", JSON.stringify(default_config));
        return default_config;
    }
    if (isUserConfig(JSON.parse(user_config))) {
        return JSON.parse(user_config) as UserConfig;
    } else {
        const default_config = defaultUserConfig();
        const merged_config = { ...default_config, ...JSON.parse(user_config) as Partial<UserConfig> };
        localStorage.setItem("user_config", JSON.stringify(merged_config));
        return default_config;
    }
}
