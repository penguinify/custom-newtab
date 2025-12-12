
import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import zip from 'vite-plugin-zip-pack'
import { crx } from '@crxjs/vite-plugin'
import manifestConfig from "./extension/manifest.config";

export default defineConfig(async () => ({
    root: './extension/',
    build: {
        outDir: '../dist/extension',
        emitAssets: true,
        copyPublicDir: false,
        cssCodeSplit: false,
        rollupOptions: {
            input: {
                main: './extension/index.html',
                nested: "./extension/options.html",
            },
        },

    },

    plugins: [
        tailwindcss(),
        // viteStaticCopy({
        //     targets: [
        //         {
        //             src: './extension/*.html',
        //             dest: '.',
        //         },
        //     ],
        // }),
        zip({
            outDir: './dist',
            outFileName: 'extension.zip',
        }),
        crx({ manifest: manifestConfig })

    ],
    server: {
        cors: {
            origin: [
                /chrome-extension:\/\//,
            ],
        },
    },
}));
