import { UserConfig } from "./types"

const updateConfigEventDetails = {
    bubbles: false,
    cancelable: false,
}

export const updateConfigEvent = new CustomEvent('userConfigUpdated', updateConfigEventDetails);

export function defaultUserConfig(): UserConfig {
    return {
        background: {
            type: "color",
            hex: "#000000"
        },
        colors: {
            textColor: "#FFFFFF"
        },
        tabTitle: "New Tab",
        tabFaviconUrl: "",
        fontFamily: "Times New Roman, serif",
        hideOptionsButtonUnlessHovered: false
    }
}

export function isUserConfig(obj: any): obj is UserConfig {
    return obj &&
        typeof obj === 'object' &&
        'background' in obj &&
        'colors' in obj &&
        'tabTitle' in obj &&
        'tabFaviconUrl' in obj &&
        'fontFamily' in obj &&
        'hideOptionsButtonUnlessHovered' in obj;
}

/**
 * Deep merge two config objects, preferring values from `oldConfig` if present,
 * but always ensuring all fields from `defaultConfig` are present.
 */
export function mergeUserConfig(defaultConfig: UserConfig, oldConfig: Partial<UserConfig> = {}): UserConfig {
    // Deep merge for nested objects (background, colors)
    return {
        ...defaultConfig,
        ...oldConfig,
        background: {
            ...defaultConfig.background,
            ...(oldConfig.background || {})
        },
        colors: {
            ...defaultConfig.colors,
            ...(oldConfig.colors || {})
        }
    }
}

export function saveUserConfig(userConfig: UserConfig): void {
    if (!chrome.storage || !chrome.storage.sync) {
        console.warn("Chrome storage not available, saving user config locally.");
        localStorage.setItem("user_config", JSON.stringify(userConfig));
        window.dispatchEvent(updateConfigEvent);
        return;
    }

    chrome.storage.sync.set({ user_config: userConfig }, () => {
        window.dispatchEvent(updateConfigEvent);
        console.info("User config saved!");
    });
}

export async function setPathInUserConfig<T>(path: string[], value: T): Promise<void> {
    let userConfig = await getUserConfig();

    let current: any = userConfig;
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!current[key] || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }
    current[path[path.length - 1]] = value;

    saveUserConfig(userConfig);
}

export async function getUserConfig(): Promise<UserConfig> {
    if (!chrome.storage || !chrome.storage.sync) {
        console.warn("Chrome storage not available, loading user config locally.");
        return getLocalUserConfig();
    }

    const result = await chrome.storage.sync.get("user_config");
    const storedConfig = result.user_config;

    if (isUserConfig(storedConfig)) {
        return storedConfig;
    } else {
        const defaultConfig = defaultUserConfig();
        const mergedConfig = mergeUserConfig(defaultConfig, storedConfig as Partial<UserConfig>);
        chrome.storage.sync.set({ user_config: mergedConfig }, () => {
            console.info("Default user config saved to Chrome storage.");
        });
        return mergedConfig;
    }
}

async function getLocalUserConfig(): Promise<UserConfig> {
    const userConfigStr = localStorage.getItem("user_config");
    const defaultConfig = defaultUserConfig();

    if (!userConfigStr) {
        localStorage.setItem("user_config", JSON.stringify(defaultConfig));
        return defaultConfig;
    }

    let parsedConfig: any;
    try {
        parsedConfig = JSON.parse(userConfigStr);
    } catch {
        localStorage.setItem("user_config", JSON.stringify(defaultConfig));
        return defaultConfig;
    }

    if (isUserConfig(parsedConfig)) {
        return parsedConfig;
    } else {
        const mergedConfig = mergeUserConfig(defaultConfig, parsedConfig);
        localStorage.setItem("user_config", JSON.stringify(mergedConfig));
        return mergedConfig;
    }
}
