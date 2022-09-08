const EndNode = require("./end-node");
const Gateway = require("./gateway");

// const NETWORK_SERVER_URI = "udp://au1.cloud.thethings.network:1700";
// const NETWORK_SESSION_KEY = "495AE1D745E2252AB9031A24930DCAC1";
// const APPLICATION_SESSION_KEY = "7C9703D513572C600AB748AD91A7A9A4";

// const GATEWAY_EUI = '00000000000000000000000000000001';

// const END_NODE_DEVADDR = "260D238A";

// const EU_868_UPLINK_CHANNELS = [868, 868.1, 868.3, 868.5];
// const EU_868_DATARATES = ['SF12BW125', 'SF11BW125', 'SF10BW125', 'SF9BW125', 'SF811BW125', 'SF7BW125'];
// const EU_868_TTN_UPLINK_CHANNELS = EU_868_UPLINK_CHANNELS.concat([867.1, 867.3, 867.5, 867.7, 867.9]);
// const EU_868_TTN_DATARATES = EU_868_DATARATES;
// const ALLOWED_UPLINK_CHANNELS = EU_868_UPLINK_CHANNELS;
// const ALLOWED_DATARATES = EU_868_DATARATES;

// Initialize virtual gateways
// const gwAddr = BigInt('0x' + GATEWAY_EUI);
// const gatewayEUI = Buffer.allocUnsafe(8);
// gatewayEUI.writeBigInt64BE(BigInt(gwAddr));
// const gateway = new Gateway.Gateway(gatewayEUI, new URL(NETWORK_SERVER_URI));

// let otaaDevice = new EndNodeOtaa(Buffer.from('1234567895464564', 'hex'), Buffer.from('0000000000000000', 'hex'))
// console.log(otaaDevice.getJoinRequestPacket())
// gateways[0].enqueueUplink(otaaDevice.getJoinRequestPacket())
//# sourceMappingURL=index.js.map

function upToGW(payload, gateway){
    // Initialize virtual nodes and start their simulation process
    var devAddr = parseInt(payload.devAddr, 16);
    var devB = Buffer.allocUnsafe(4);
    devB.writeUInt32BE(devAddr);
    var endNode = new EndNode.EndNode(devB, Buffer.from(payload.nwkSessionKey, 'hex'), Buffer.from(payload.appSessionKey, 'hex'), gateway);
    return endNode.sendPacket(payload.data, payload.frameCount, payload.ts, payload.freq, payload.datarate, payload.chan, payload.rfch);
}

module.exports = function (RED) {
    function LoraSim(config) {
        RED.nodes.createNode(this, config);
        //
        var node = this;
        node.on('input', function (msg) {
            var gateway_eui = msg.gateway_eui || config.gateway_eui || '';
            var nwk_server_uri = msg.nwk_server_uri || config.nwk_server_uri || '';
            // Initialize virtual gateways
            const gwAddr = BigInt('0x' + gateway_eui);
            const gatewayEUI = Buffer.allocUnsafe(8);
            gatewayEUI.writeBigInt64BE(BigInt(gwAddr));
            const gateway = new Gateway.Gateway(gatewayEUI, new URL(nwk_server_uri));
            //
            promise = upToGW(msg.payload, gateway);
            if (promise){
                promise.then((rsp)=>{
                    msg.lora_sim = true;
                    node.send(msg);
                    gateway.close();
                }).catch((err)=>{
                    msg.lora_sim = false;
                    node.send(msg);
                    gateway.close();
                });
            } else {
                msg.lora_sim = false;
                node.send(msg);
            }
        });
    }
    RED.nodes.registerType("lora-sim", LoraSim);
}

// var gateway_eui = "00000000000000000000000000000001";
// var nwk_server_uri = "udp://au1.cloud.thethings.network:1700";
// // Initialize virtual gateways
// const gwAddr = BigInt('0x' + gateway_eui);
// const gatewayEUI = Buffer.allocUnsafe(8);
// gatewayEUI.writeBigInt64BE(BigInt(gwAddr));
// const gateway = new Gateway.Gateway(gatewayEUI, new URL(nwk_server_uri));
// //
// const payload1 = {
//     data: "hahahihihuhu",
//     frameCount: 5,
//     ts: 1662533491,
//     freq: 868.100000,
//     datarate: "SF8BW125",
//     nwkSessionKey: "495AE1D745E2252AB9031A24930DCAC1",
//     appSessionKey: "7C9703D513572C600AB748AD91A7A9A4",
//     devAddr: "260D238A"
// }
// upToGW(payload1, gateway);