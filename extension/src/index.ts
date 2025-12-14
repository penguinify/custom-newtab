import { Router } from "./framework/penexutils";
import { NewTab } from "./routes/newtab";
import { Options } from "./routes/options";
import { Widgets } from "./routes/widgets";
import Layout from "./ui/layout";
import { WidgetRegistry } from "./widgetmanager";


// at some point i will fix this damn router that I made two years ago
let router: Router;
if (window.location.pathname === '/index.html') {
    // content refers to the div id in layout.ts
    router = new Router("content", Layout, '/index.html', [
        new NewTab()
    ]);
} else if (window.location.pathname === '/options.html') {
    router = new Router("content", Layout, '/options.html', [
        new Options()
    ]);
} else if (window.location.pathname === '/widgets.html') {
    router = new Router("content", Layout, '/widgets.html', [
        new Widgets()
    ]);
}


const modules = import.meta.glob('./ui/widgets/*.widget.ts', { eager: true });
export { router };


