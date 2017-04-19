

import lm = require("lime");


import { MainCtrlCountdown } from "./controllers/MainCtrlCountdown";



// Widget factory function
export var widgetFactory = (context: lm.IWidgetContext): lm.IWidgetInstance => {
    var m = context.getAngularContext().module;
    // Add controllers to the provided AngularJS module


    m.controller("MainCtrlCountdown", MainCtrlCountdown);

    // Create and return the widget instance
    var instance: lm.IWidgetInstance = {
        angularConfig: <lm.IAngularWidgetConfig>{
            relativeTemplateUrl: "./views/countdown.html"
        },
        actions: <lm.IWidgetAction[]>[]
    };
    return instance;
};


