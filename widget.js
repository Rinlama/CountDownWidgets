define(["require", "exports", "./controllers/MainCtrlCountdown"], function (require, exports, MainCtrlCountdown_1) {
    "use strict";
    // Widget factory function
    exports.widgetFactory = function (context) {
        var m = context.getAngularContext().module;
        // Add controllers to the provided AngularJS module
        m.controller("MainCtrlCountdown", MainCtrlCountdown_1.MainCtrlCountdown);
        // Create and return the widget instance
        var instance = {
            angularConfig: {
                relativeTemplateUrl: "./views/countdown.html"
            },
            actions: []
        };
        return instance;
    };
});
//# sourceMappingURL=widget.js.map