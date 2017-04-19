define(["require", "exports", "lime"], function (require, exports, lm) {
    "use strict";
    var MainCtrlCountdown = (function () {
        function MainCtrlCountdown(scope, interval) {
            var _this = this;
            this.scope = scope;
            this.interval = interval;
            this.counter = 0;
            this.cdshow = false;
            // Get the widget context and the widget instance that are made available on the scope by the framework
            this.widgetContext = scope[lm.WidgetConstants.widgetContextKey];
            this.widgetInstance = scope[lm.WidgetConstants.widgetInstanceKey];
            this.logPrefix = "[" + this.widgetContext.getId() + "] ";
            var pageId = this.widgetContext.getPageId();
            this.pageId = pageId;
            this.lang = this.widgetContext.getLanguage();
            var settings = this.widgetContext.getSettings();
            // Callback triggered from Framework when settings are saved
            this.widgetInstance.settingsSaved = function (saveArg) {
                _this.updateMessageType();
            };
            this.updateMessageType();
            this.startcdTime();
            this.message(lm.WidgetMessageType.Info, this.lang.get("nodata"));
        }
        MainCtrlCountdown.prototype.updateMessageType = function () {
            this.username = this.widgetContext.getSettings().get("username");
            this.password = this.widgetContext.getSettings().get("password");
            this.webservice = this.widgetContext.getSettings().get("webservice");
            this.company = this.widgetContext.getSettings().get("company");
            this.recmessage = this.widgetContext.getSettings().get("messageType");
            this.registerHandler();
        };
        MainCtrlCountdown.prototype.registerHandler = function () {
            var _this = this;
            var messagetype = this.recmessage;
            var newMessageType = messagetype + this.pageId;
            this.messagetype = newMessageType;
            var callback = function (args) { _this.handleMessage(args); };
            infor.companyon.client.registerMessageHandler(newMessageType, callback);
            lm.Log.debug(this.logPrefix + "Message handler registered for message type: " + newMessageType);
        };
        MainCtrlCountdown.prototype.handleMessage = function (Linestat) {
            if (Linestat && Linestat.type === "LineStation") {
                this.asod = Linestat.assemblyod;
                this.Lnstation = Linestat.Lnstation;
                this.getAsod();
            }
            lm.Log.debug(this.logPrefix + "Received message from sender widget: " + JSON.stringify(Linestat));
        };
        MainCtrlCountdown.prototype.getAsod = function () {
            var _this = this;
            this.widgetContext.removeWidgetMessage();
            var that = this;
            this.setBusy(true);
            var request = this.createRequestasd(this.username, this.password, this.company, this.webservice);
            return this.widgetContext.executeIonApiAsync(request)
                .then(function (response) {
                var statorarray = [];
                $(response.data).find("Output").each(function (key, value) {
                    var asln = $(value).find("NameValue").filter("[name='asln']").text();
                    var asso = $(value).find("NameValue").filter("[name='asso']").text();
                    var lsst = $(value).find("NameValue").filter("[name='asst']").text();
                    var serial = $(value).find("NameValue").filter("[name='serial']").text();
                    var item = $(value).find("NameValue").filter("[name='item']").text();
                    statorarray.push({
                        "asln": asln,
                        "asso": asso,
                        "asst": lsst,
                        "serial": serial,
                        "item": item
                    });
                });
                var asorder = { "asln": statorarray[0].asln, "asso": statorarray[0].asso, "serial": statorarray[0].serial, "item": statorarray[0].item };
                _this.asln = asorder.asln;
                _this.getasgnmt();
                _this.setBusy(false);
            }).catch(function (err) {
                _this.message(lm.WidgetMessageType.Alert, _this.lang.get("error"));
                _this.setBusy(false);
            });
        };
        //REQUEST TO ION API TO CONNECT 
        MainCtrlCountdown.prototype.createRequestasd = function (username, password, company, webservice) {
            var request = {
                method: "POST",
                data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pur="http://www.infor.com/businessinterface/GenericQuery" >' +
                    '<soapenv:Header>' +
                    '<pur:Activation>' +
                    '<username>' + username + '</username>' +
                    '<password>' + password + '</password>' +
                    '<company>' + company + '</company>' +
                    '</pur:Activation>' +
                    '</soapenv:Header>' +
                    '<soapenv:Body>' +
                    '<pur:Show>' +
                    '<ShowRequest>' +
                    '<DataArea>' +
                    '<GenericQuery>' +
                    '<Definition>' + 'select tiasc200.asso:asso, tiasc200.asln:asln,tiasc200.asst:asst,tiasc200.mser:serial,tiasc200.item:item from tiasc200 where tiasc200.asso="' + this.asod + '"' + '</Definition>' +
                    '</GenericQuery>' +
                    '</DataArea>' +
                    '</ShowRequest>' +
                    '</pur:Show>' +
                    '</soapenv:Body>' +
                    '</soapenv:Envelope>',
                url: webservice,
                cache: false,
                headers: {
                    "Accept": "text/html",
                    "Content-Type": "text/xml; charset=\"utf-8\""
                },
                responseType: "text/xml; charset=\"utf-8\"",
                params: "",
                timeout: 30000
            };
            return request;
        };
        MainCtrlCountdown.prototype.getasgnmt = function () {
            var _this = this;
            var that = this;
            this.setBusy(true);
            var request = this.createRequestasgnmt(this.username, this.password, this.company, this.webservice);
            return this.widgetContext.executeIonApiAsync(request)
                .then(function (response) {
                var asgnarray = [];
                $(response.data).find("Output").each(function (key, value) {
                    var asgt = $(value).find("NameValue").filter("[name='asgt']").text();
                    var efdt = $(value).find("NameValue").filter("[name='efdt']").text();
                    var oftm = $(value).find("NameValue").filter("[name='oftm']").text();
                    var cytm = $(value).find("NameValue").filter("[name='cytm']").text();
                    var avge = $(value).find("NameValue").filter("[name='avge']").text();
                    var actv = $(value).find("NameValue").filter("[name='actv']").text();
                    asgnarray.push({
                        "asgt": asgt,
                        "efdt": efdt.substr(0, 10),
                        "oftm": oftm,
                        "cytm": cytm,
                        "actv": actv,
                        "avge": avge
                    });
                });
                var todaydate = new Date();
                var fttodaydt = todaydate.getFullYear().toString().substr(0, 5) + "-" + ("0" + (todaydate.getMonth() + 1)).slice(-2) + "-" + ("0" + (todaydate.getDate())).slice(-2);
                var dataset = asgnarray.filter(function (element, index, array) { return element.efdt >= fttodaydt; });
                var tktime = [];
                for (var i = 0; i < dataset.length; i++) {
                    if (dataset[i].actv === "1" && dataset[i].avge === "2") {
                        tktime.push({ "asgt": dataset[i].asgt, "efdt": dataset[i].efdt, "oftm": dataset[i].oftm, "cytm": dataset[i].cytm + " min" });
                    }
                }
                _this.asgnobj = tktime[0];
                //start countdown
                //  this.startcdTime();
                _this.setBusy(false);
            }).catch(function (err) {
                _this.message(lm.WidgetMessageType.Alert, _this.lang.get("error"));
                _this.setBusy(false);
            });
        };
        //REQUEST TO ION API TO CONNECT 
        MainCtrlCountdown.prototype.createRequestasgnmt = function (username, password, company, webservice) {
            var request = {
                method: "POST",
                data: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pur="http://www.infor.com/businessinterface/GenericQuery" >' +
                    '<soapenv:Header>' +
                    '<pur:Activation>' +
                    '<username>' + username + '</username>' +
                    '<password>' + password + '</password>' +
                    '<company>' + company + '</company>' +
                    '</pur:Activation>' +
                    '</soapenv:Header>' +
                    '<soapenv:Body>' +
                    '<pur:Show>' +
                    '<ShowRequest>' +
                    '<DataArea>' +
                    '<GenericQuery>' +
                    '<Definition>' + 'select tiasc510.asgt:asgt, tiasc510.efdt:efdt,tiasc510.oftm:oftm,tiasc510.cytm:cytm,tiasc510.avge:avge,tiasc510.actv:actv from tiasc510 where tiasc510.asln="' + this.asln + '"' + '</Definition>' +
                    '</GenericQuery>' +
                    '</DataArea>' +
                    '</ShowRequest>' +
                    '</pur:Show>' +
                    '</soapenv:Body>' +
                    '</soapenv:Envelope>',
                url: webservice,
                cache: false,
                headers: {
                    "Accept": "text/html",
                    "Content-Type": "text/xml; charset=\"utf-8\""
                },
                responseType: "text/xml; charset=\"utf-8\"",
                params: "",
                timeout: 30000
            };
            return request;
        };
        MainCtrlCountdown.add = function (m) {
            m.controller("MainCtrlCountdown", MainCtrlCountdown);
        };
        MainCtrlCountdown.prototype.setBusy = function (isBusy) {
            this.widgetContext.setState(isBusy ? lm.WidgetState.busy : lm.WidgetState.running);
        };
        MainCtrlCountdown.prototype.message = function (type, message) {
            this.widgetContext.showWidgetMessage({ type: type, message: message });
        };
        MainCtrlCountdown.prototype.startcdTime = function () {
            var _this = this;
            this.cdshow = true;
            this.interval.cancel(this.timer);
            this.counter = 59;
            var dt = new Date();
            dt.setSeconds(this.counter);
            dt.setMinutes(1 - 1);
            this.timer = this.interval(function () {
                dt.setSeconds(_this.counter--);
                _this.cdtime = { min: dt.getMinutes(), sec: dt.getSeconds() };
                if (_this.counter === -1) {
                    _this.counter = 59;
                    dt.setMinutes(dt.getMinutes() - 1);
                    if (dt.getMinutes() === 59) {
                        _this.interval.cancel(_this.timer);
                        _this.stopTimer = "CountDown Stop";
                    }
                    console.log(dt.getMinutes());
                }
            }, 1000);
        };
        return MainCtrlCountdown;
    }());
    // Use the $inject array to avoid issues with minification
    MainCtrlCountdown.$inject = ["$scope", "$interval"];
    exports.MainCtrlCountdown = MainCtrlCountdown;
});
//# sourceMappingURL=MainCtrlCountdown.js.map