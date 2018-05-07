const net = require('net');


const MulticastSocket = require('./MulticastSocket');

function ControlClient(config) {
    this.leds = {};
    MulticastSocket.call(this, config);
}


let proto = ControlClient.prototype =
    Object.create(MulticastSocket.prototype);

proto.connected = false;

// 打印消息
proto.onInfo = function (msg) {
    console.log(msg);
}

// 设备搜索网络连接成功
proto.onConnected = function (remote) {
    var me = this;
    this.onInfo(`Server listen on: ${remote.address}:${remote.port}`);
    this.connected = true;
};

// 设备搜索网络断开
proto.onDisconnected = function () {
    this.onInfo("Disconnected");
    this.connected = false;
};

// 错误消息
proto.onError = function (error) {
    this.onInfo('Error:\r\n ' + error);
};

// 搜索设备回调
proto.onDiagram = function (message) {
    console.log('multi-casting:', message)
    const headers = message.split("\r\n");
    let did = "";
    let loc = "";
    for (i = 0; i < headers.length; i++) {
        if (headers[i].indexOf("id:") >= 0)
            did = headers[i].slice(4);
        if (headers[i].indexOf("Location:") >= 0)
            loc = headers[i].slice(10);
    }
    if (did == "" || loc == "")
        return;

    if (did in this.leds) {
        return;
    } else {
        let data = {};
        headers.forEach(header => {
            let keyVal = header.split(':');
            if (keyVal.length == 2)
                data[keyVal[0]] = keyVal[1].trim()
        });

        loc = loc.split("//")[1];
        this.leds[did] = {
            did,
            location: loc,
            data,
            connected: false,
            client: null
        };
        this.onAddDevice(did, loc, data);
    }

};

// 添加设备
proto.onAddDevice = function (did, location, data) { };


// 设备消息
proto.onNotify = (data) => { };

// 搜索设备
proto.scan = function () {
    this.sendDiagram('M-SEARCH * HTTP/1.1\r\n MAN:"ssdp:discover"\r\n wifi_bulb');
};

// 连接设备
proto.connectDevice = function (did) {
    var led = this.leds[did];
    tmp = led.location.split(":");
    address = tmp[0];
    port = tmp[1];

    if (!led.connected) {
        this.onInfo("Connecting ...");

        const client = net.connect(port, address, () => {
            led.connected = true;
            this.onNotify({ did, method: 'connect' ,params:1 });
        })
        client.on('data', (message) => {
            message = message.toString('utf-8');
            console.log('device-message', message);
            this.onNotify(Object.assign({did},JSON.parse(message)));
        })
        client.on('error', (error) => {
            this.onError(error);
        })
        client.on('end', () => {
            led.connected = false;
            this.onNotify({ did, method: 'connect', params: 0 });
        })
        led.client = client;
    } else {
        this.onInfo("already connected");
    }
};

// 发送命令
proto.sendCommand = function (did, guid, method, params) {
    var led = this.leds[did];
    if (led.connected && led.client) {
        const message = JSON.stringify({
            id: guid,
            method,
            params
        })
        led.client.write(`${message}\r\n`, () => {
            this.onInfo("REQ :" + message);
        });
    } else {
        this.onInfo("Device is not connected yet");
    }
};


module.exports = ControlClient
