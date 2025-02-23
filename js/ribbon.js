// ribbon.js - 更新初始化函数
function OnAddinLoad(ribbonUI) {
    try {
        if (typeof window.Application !== 'object') {
            window.Application = {};
        }
        window.Application.ribbonUI = ribbonUI;

        // 触发应用初始化
        AppState.init().catch(error => {
            console.error('WPS 插件初始化失败:', error);
        });

        return true;
    } catch (error) {
        console.error('OnAddinLoad 失败:', error);
        return false;
    }
}

// ribbon.js中的OnAction函数
function OnAction(control) {
    const eleId = control.Id
//    console.log("Button clicked:", eleId);

    if (typeof (window.Application.Enum) != "object") { // 如果没有内置枚举值
        window.Application.Enum = WPS_Enum;
    }

    switch (eleId) {
        case "btnShowAI": {
//            console.log("Showing AI taskpane");
            let tsId = window.Application.PluginStorage.getItem("taskpane_id");
//            console.log("tsId：", tsId);

            if (!tsId){
                let tskpane = window.Application.CreateTaskPane(GetUrlPath() + "/ui/dialog.html");
                let id = tskpane.ID;
                window.Application.PluginStorage.setItem("taskpane_id", id);
                if (tskpane) {
                    tskpane.Visible = !tskpane.Visible;

//                        console.log("tskpane.Visible 11");
                        tskpane.DockPosition = window.Application.Enum.msoCTPDockPositionRight;
                        tskpane.Width = 1000;
                        tskpane.Visible = true;
                        if (window.Application.ActiveDocument) {
                            window.Application.ActiveDocument.ActiveWindow.View.Zoom.PageFit = 1;
                        }
                }

            } else {
                let tskpane = window.Application.GetTaskPane(tsId);
                let id = tskpane.ID;
                window.Application.PluginStorage.setItem("taskpane_id", id);
                if (tskpane) {
                    tskpane.Visible = !tskpane.Visible;
                    // 根据可见性调整显示
                    if (tskpane.Visible) {
//                        console.log("tskpane.Visible T");
                        tskpane.DockPosition = window.Application.Enum.msoCTPDockPositionRight;
                        tskpane.Width = 1000;
                        if (window.Application.ActiveDocument) {
                            window.Application.ActiveDocument.ActiveWindow.View.Zoom.PageFit = 1;
                        }
                    } else {
//                        console.log("tskpane.Visible F");
                        tskpane.Width = 1000;
                        if (window.Application.ActiveDocument) {
                            window.Application.ActiveDocument.ActiveWindow.View.Zoom.PageFit = 2;
                        }
                    }
                }
            }
            break;
        }
        case "btnShowSettings":
            window.Application.ShowDialog(
                GetUrlPath() + "/ui/settings.html",
                "设置",
                400,
                600,
                false
            );
            break;

        case "btnShowabouts":
            window.Application.ShowDialog(
                GetUrlPath() + "/ui/about.html",
                "关于",
                400,
                600,
                false
            );
            break;

        default:
            break;
    }
    return true;
}

function GetImage(control) {
    const eleId = control.Id
    switch (eleId) {
        case "btnShowAI":
            return "images/1.svg"
        case "btnShowSettings":
            return "images/2.svg"
        case "btnShowabouts":
            return "images/3.1.svg"
        default:
            return "images/3.1.svg"
    }
}

function OnGetEnabled(control) {
    return true
}