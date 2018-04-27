const dgram = require('dgram')

/**
 *
 * @param {Object} config
 * @param {String} config.address
 * @param {Number} config.port
 * @constructor
 */
function MulticastSocket(config) {
    this.config = config;

    let client = dgram.createSocket('udp4');
    client.on('listening', () => {
        let remote = this.client.address();
        this.onConnected(remote);
    })
    client.on('message', (msg, rinfo) => {
        this.onDiagram(msg.toString('utf-8'), rinfo.address, rinfo.port);
    });
    client.on('error', (err) => {
        this.onError(err);
    })
    client.on('close', () => {
        this.onDisconnected();
    })
    this.client = client;
}

var mc_proto = MulticastSocket.prototype;

mc_proto.onError = (err) => { };
mc_proto.onConnected = (remote) => { };
mc_proto.onDiagram = (arrayBuffer, remote_address, remote_port) => { };
mc_proto.onDisconnected = () => { };


mc_proto.sendDiagram = function (message, callback) {
    if (message) {
        var { config, client } = this;
        try {
            client.send(message, config.port, config.address, (err) => {
                if (err) {
                    client.close();
                    this.onError('Message:' + err);
                }
                else {
                    callback && callback.call(this, true);
                    console.log('Send:\r\n'+ message);
                }
            });
        } catch (err) {
            this.onError('Exception: ' + err);
        }
    } else if (callback) {
        callback.call(this, false);
    }
};


module.exports = MulticastSocket