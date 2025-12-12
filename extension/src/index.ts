import { Router } from "./framework/penexutils";
import { NewTab } from "./routes/newtab";
import { Options } from "./routes/options";
import Layout from "./ui/layout";


let router: Router;
console.log(window.location.pathname);
if (window.location.pathname === '/index.html') {
    // content refers to the div id in layout.ts
    router = new Router("content", Layout, '/', [
        new NewTab()
    ]);
} else if (window.location.pathname === '/options.html') {
    router = new Router("content", Layout, '/options', [
        new Options()
    ]);
}





export { router };


