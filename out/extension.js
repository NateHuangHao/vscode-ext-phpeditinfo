'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const phpType = /.*\.php/;
let config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8').toString());
let w = vscode.window;
let wp = vscode.workspace;
let env = vscode.env;
let dm = w.activeTextEditor.document;
let wlog = [
    '/***',
    ' * @author: ${this.user_name}',
    ' * @create_time: ${this.create_time}',
    ' * @last_modify: ${this.user_name}',
    ' * @modify_time: ${this.modify_time}',
    ' **/',
    '',
];
function activate(context) {
    //设置用户
    let setUser = vscode.commands.registerCommand('setUser', () => __awaiter(this, void 0, void 0, function* () {
        config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8').toString());
        let pName = config.userName || '';
        let user_name = yield vscode.window.showInputBox({ value: pName });
        if (pName == user_name || user_name == null || user_name == undefined) {
        }
        else {
            config.userName = user_name;
            fs.writeFileSync(__dirname + '/config.json', JSON.stringify(config), 'utf8');
            vscode.window.showInformationMessage('用户名更改成功');
            setTimeout(() => {
                // 关闭弹出框
                vscode.commands.executeCommand("workbench.action.closeMessages");
            }, 800);
        }
    }));
    //保存信息
    let saveByAuthor = vscode.commands.registerCommand('saveByAuthor', () => {
        // 执行文件保存命令
        vscode.commands.executeCommand("workbench.action.files.save");
        /**
         * 判断文件类型，判断是否是php文件
         * 1. 得到文件名字，判断后缀,
         * 2. 如果是php文件，判断 首行是否有注释，没有则插入，有则修改
         */
        let fN = dm.fileName;
        if (phpType.exec(fN)) {
            // 判断是否有注释
            let is_exit = 0;
            let f_info = {
                user_name: config.userName,
                create_time: format(new Date()),
                last_modify: config.userName,
                modify_time: format(new Date()),
                line_count: dm.lineCount
            };
            let lineText = dm.lineAt(0);
            if (lineText.text == '/***') {
                let wse = new vscode.WorkspaceEdit();
                wse.replace(dm.uri, new vscode.Range(3, 0, 6, 0), getFileInfo(wlog.slice(3, wlog.length), f_info));
                wp.applyEdit(wse);
                is_exit = 1;
            }
            ;
            if (is_exit === 0) {
                let wse = new vscode.WorkspaceEdit();
                wse.insert(dm.uri, new vscode.Position(0, 0), getFileInfo(wlog, f_info));
                wp.applyEdit(wse);
            }
        }
        else {
        }
    });
    context.subscriptions.push(setUser);
    context.subscriptions.push(saveByAuthor);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
function getFileInfo(m, u) {
    let a = [];
    a[0] = 'let j=[]';
    for (let i = 0; i < m.length; i++) {
        const element = m[i];
        a.push(`j.push(\`${element}\`)`);
    }
    ;
    a.push(`return j.join('\\r\\n')`);
    let s = a.join(';');
    return new Function(s).apply(u);
}
function format(d) {
    return `${d.getFullYear().toString().substring(2, 4)}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
}
//# sourceMappingURL=extension.js.map