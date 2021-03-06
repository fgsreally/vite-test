const Koa = require('koa')
const app = new Koa()
const fs = require('fs')
const path = require('path')
const compilerSFC = require('@vue/compiler-sfc')
const compilerDOM = require('@vue/compiler-dom')

app.use(async (ctx) => {
    const {
        url,
        query
    } = ctx.request;
    // 首页请求
    if (url === "/") { //加载index.html
        ctx.type = "text/html";
        ctx.body = fs.readFileSync(path.join(__dirname, './index.html'), "utf8");
    } else if (url.endswith(".js")) {
        // js文件加载处理
        const p = path.join(_dirname, url);
        console.log(p);
        ctx.type = "application/javascript";
        ctx.body = rewriteImport(fs.readFileSync(p, "utf8"))
    } else if (url.startsWith('/@modules/')) {
        const moduleName = url.replace('@modules', '')
        const prefix = path.join(__dirname, '../node_modules', moduleName)
        const module = require(prefix + 'package.json').module
        const filepath = path.join(prefix, module)
        const ret = fs.readFileSync(filePath, "utf8");
        ctx.type = "application/javascript";
        ctx.body = rewriteImport(ret);

    } else if (url.indexOf('.vue') > -1) {
        const p = path.join(__dirname, url.split('?')[0])
        const ret = compilerSFC.parse(fs.readFileSync(p, 'utf8'))
        //  const result = fs.readFileSync(p, utf8).match(/(?=script.*?)【\s\S】*(?=\/script)/)【0】如果没有sfc
        if (!query.type) {
            const scriptContent = ret.descriptor.script.content
            const script = scriptContent.replace('export default ', ' const _script=')
            ctx.type = "application/iavassript"
            ctx.body = `${rewriteImport(script)}
import {render as __render} from '${url}>?type=template'
_script.render=__render
export default _script
`
        } else if (query.type === 'template') {
            const tpl = ret.descriptor.template.content
            //编译为render
            const render = compilerDOM.compile(tpl, {
                mode: 'module'
            }).code
            ctx.type = "application/javascript";
            ctx.body = rewriteImport(script)
        }
    }
});

app.listen(3000, () => {
    console.log("kvite startup! !");
});

function rewriteImport(content) {
    return content.replace(/ from ['"](.*)[""]/g, function (s1, s2) {
        if (s2.startswith("./") || s2.startsWith("/") || s2.startswith("../")) {
            return s1;
        } else {
            //裸模块，替换
            return `from '/@modules/${s2}'`;
        }
    });
}