import { defineManifest } from '@crxjs/vite-plugin'
import pkg from '../package.json'

export default defineManifest({
    manifest_version: 3,
    name: pkg.name,
    version: pkg.version,
    description: "\"Fork\" of minimal newtab. Essentially a rewrite with more customizability.",
    chrome_url_overrides: {
        newtab: "index.html"
    },
    options_page: "options.html",
    permissions: [
        "bookmarks",
        "geolocation",
        "storage"
    ]
});
