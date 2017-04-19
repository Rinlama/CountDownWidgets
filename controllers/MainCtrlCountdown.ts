import lm = require("lime");

interface IlineStation {
    type:string;
    assemblyod: string;
    Lnstation: string;
}

interface ICountDown {
    min: number;
    sec: number;
}

export class MainCtrlCountdown {

    private widgetContext: lm.IWidgetContext;
    private widgetInstance: lm.IWidgetInstance;
    private listviewStationOd: xi.IListViewOptions;
    private logPrefix: string;
    private messagetype: string;
    private pageId: string;
    private username: string;
    private password: string;
    private company: string;
    private webservice: string;
    private recmessage: string;
    private asod: string;
    private asln: string;
    private asgnobj: any;
    private Lnstation: string;
    private lang: lm.ILanguage;
    private cdtime: ICountDown;
    private timer: any;
    private counter: number = 0;
    private cdshow: boolean = false;
    private stopTimer: string;

    // Use the $inject array to avoid issues with minification
    static $inject = ["$scope","$interval"];

    constructor(public scope: ng.IScope, private interval: ng.IIntervalService) {

        // Get the widget context and the widget instance that are made available on the scope by the framework
        this.widgetContext = scope[lm.WidgetConstants.widgetContextKey];
        this.widgetInstance = scope[lm.WidgetConstants.widgetInstanceKey];
        this.logPrefix = "[" + this.widgetContext.getId() + "] ";
        const pageId = this.widgetContext.getPageId();
        this.pageId = pageId;
        this.lang = this.widgetContext.getLanguage();

        const settings = this.widgetContext.getSettings();

        // Callback triggered from Framework when settings are saved
        this.widgetInstance.settingsSaved = (saveArg: lm.IWidgetSettingsArg) => {

            this.updateMessageType();
        };

        this.updateMessageType();
        this.startcdTime();
        this.message(lm.WidgetMessageType.Info, this.lang.get("nodata"));
    }


    private updateMessageType(): void {

        this.username = this.widgetContext.getSettings().get<string>("username");
        this.password = this.widgetContext.getSettings().get<string>("password");
        this.webservice = this.widgetContext.getSettings().get<string>("webservice");
        this.company = this.widgetContext.getSettings().get<string>("company");
        this.recmessage = this.widgetContext.getSettings().get<string>("messageType");
        this.registerHandler();

    }

    private registerHandler(): void {
        let messagetype = this.recmessage;
        const newMessageType = messagetype + this.pageId;
        this.messagetype = newMessageType;
        const callback = (args: IlineStation) => { this.handleMessage(args) };
        infor.companyon.client.registerMessageHandler(newMessageType, callback);
        lm.Log.debug(this.logPrefix + "Message handler registered for message type: " + newMessageType);

    }

    private handleMessage(Linestat: IlineStation): void {
        if (Linestat && Linestat.type === "LineStation") {
            this.asod = Linestat.assemblyod;
            this.Lnstation = Linestat.Lnstation;
            this.getAsod();

        }

        lm.Log.debug(this.logPrefix + "Received message from sender widget: " + JSON.stringify(Linestat));
    }



    private getAsod(): ng.IHttpPromiseCallbackArg<any> {
        this.widgetContext.removeWidgetMessage();
        let that = this;
        this.setBusy(true);
        const request = this.createRequestasd(this.username, this.password, this.company, this.webservice);
        return this.widgetContext.executeIonApiAsync(request)
            .then((response) => {
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
                        })

                    });
                    let asorder = { "asln": statorarray[0].asln, "asso": statorarray[0].asso, "serial": statorarray[0].serial, "item": statorarray[0].item };
                    this.asln = asorder.asln;
                    this.getasgnmt();
                    this.setBusy(false);

            }).catch((err) => {
                this.message(lm.WidgetMessageType.Alert, this.lang.get("error"));
                this.setBusy(false);
            });
    

    }

    //REQUEST TO ION API TO CONNECT 
    private createRequestasd(username, password, company, webservice): lm.IIonApiRequestOptions {
        const request: lm.IIonApiRequestOptions = {
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
            '<Definition>' + 'select tiasc200.asso:asso, tiasc200.asln:asln,tiasc200.asst:asst,tiasc200.mser:serial,tiasc200.item:item from tiasc200 where tiasc200.asso="'+this.asod+'"' + '</Definition>' +
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
    }

    private getasgnmt(): ng.IHttpPromiseCallbackArg<any> {
        let that = this;
        this.setBusy(true);
        const request = this.createRequestasgnmt(this.username, this.password, this.company, this.webservice);
        return this.widgetContext.executeIonApiAsync(request)
            .then((response) => {
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
                    })

                });
                let todaydate = new Date();
                let fttodaydt = todaydate.getFullYear().toString().substr(0, 5) + "-" + ("0" + (todaydate.getMonth() + 1)).slice(-2) + "-" + ("0" + (todaydate.getDate())).slice(-2);
                let dataset = asgnarray.filter((element, index, array) => element.efdt>= fttodaydt);

                let tktime = [];
                for (let i = 0; i < dataset.length; i++){
                    if (dataset[i].actv === "1" && dataset[i].avge === "2") {
                        tktime.push({ "asgt": dataset[i].asgt, "efdt": dataset[i].efdt, "oftm": dataset[i].oftm, "cytm": dataset[i].cytm + " min" });
                    }
                }
                this.asgnobj = tktime[0];
                //start countdown
              //  this.startcdTime();

                this.setBusy(false);

            }).catch((err) => {
                this.message(lm.WidgetMessageType.Alert, this.lang.get("error"));
                this.setBusy(false);
            });


    }

    //REQUEST TO ION API TO CONNECT 
    private createRequestasgnmt(username, password, company, webservice): lm.IIonApiRequestOptions {
        const request: lm.IIonApiRequestOptions = {
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
    }
  

    public static add(m: ng.IModule) {
        m.controller("MainCtrlCountdown", MainCtrlCountdown);
    }
    private setBusy(isBusy: boolean): void {
        this.widgetContext.setState(isBusy ? lm.WidgetState.busy : lm.WidgetState.running);
    }
    private message(type: number, message: string) {
        this.widgetContext.showWidgetMessage({ type: type, message: message });

    }

    private startcdTime() {
        this.cdshow = true;
        this.interval.cancel(this.timer);
        this.counter = 59;
        let dt = new Date();
        dt.setSeconds(this.counter);
        dt.setMinutes(1-1);
        this.timer = this.interval(() => {
            dt.setSeconds(this.counter--);
                 
            this.cdtime = { min: dt.getMinutes(), sec: dt.getSeconds() };
            if (this.counter === -1) {
                this.counter = 59;
                dt.setMinutes(dt.getMinutes() - 1)
                if (dt.getMinutes() === 59) {
                    this.interval.cancel(this.timer);
                    this.stopTimer = "CountDown Stop";
                }
                console.log(dt.getMinutes());
            }
        }, 1000);
      

    }

}

