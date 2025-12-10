
import { defineConfig } from "vite";
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'


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

    plugins: [tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: './manifest.json',
          dest: '.',
        },
      ],
    }),
    ]
}));
