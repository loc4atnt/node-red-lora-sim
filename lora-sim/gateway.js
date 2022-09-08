var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gateway = void 0;
const packet_forwarder_1 = __importDefault(require("packet-forwarder"));
const random_1 = __importDefault(require("random"));
// const EU_868_UPLINK_CHANNELS = [868, 868.1, 868.3, 868.5];
// const EU_868_DATARATES = ['SF12BW125', 'SF11BW125', 'SF10BW125', 'SF9BW125', 'SF811BW125', 'SF7BW125'];
// const EU_868_TTN_UPLINK_CHANNELS = EU_868_UPLINK_CHANNELS.concat([867.1, 867.3, 867.5, 867.7, 867.9]);
// const EU_868_TTN_DATARATES = EU_868_DATARATES;
// const ALLOWED_UPLINK_CHANNELS = EU_868_UPLINK_CHANNELS;
// const ALLOWED_DATARATES = EU_868_DATARATES;
class Gateway {
    constructor(gatewayEUI, networkServer) {
        this.gatewayEUI = gatewayEUI;
        this.networkServer = networkServer;
        let pareto = random_1.default.pareto(.25);
        this._rssiRandomGenerator = () => { return -30 - (1 / pareto() * 90); };
        this._lsnrRandomGenerator = random_1.default.normal(3, 10);
        this._packetForwarder = new packet_forwarder_1.default({ gateway: gatewayEUI.toString('hex'), target: this.networkServer.hostname, port: parseInt(this.networkServer.port) });
        //this._packetForwarder.on('message', (msg) => { console.log(msg.toString('hex'))} ) 
    }
    sendUplink(packet, ts, sfreq, sDatr, schan, srfch) {
        let phyPayload = packet.getPHYPayload();
        if (phyPayload) {
            let data = phyPayload.toString('base64');
            const message = {
                rxpk: [{
                        // time: new Date().toISOString(),
                        // tmms: null,
                        tmst: ts,
                        freq: sfreq,//(packset.getMType() == "Join Request") ? 868.1 : ALLOWED_UPLINK_CHANNELS[Math.floor(Math.random() * ALLOWED_UPLINK_CHANNELS.length)],
                        chan: schan,
                        rfch: srfch,
                        stat: 1,
                        modu: 'LORA',
                        datr: sDatr,//'SF8BW125',//ALLOWED_DATARATES[Math.floor(Math.random() * ALLOWED_DATARATES.length)],
                        codr: '4/5',
                        rssi: Math.round(this._rssiRandomGenerator()),
                        lsnr: /*12,*/Math.round(this._lsnrRandomGenerator() * 10) / 10.,
                        size: phyPayload.length,
                        data: data
                    }]
            };
            
            var _a;
            // console.log(`Gateway #${this.gatewayEUI.toString('hex')} is sending packet #${packet.getFCnt()} from device ${(_a = packet.DevAddr) === null || _a === void 0 ? void 0 : _a.toString('hex')}`);
            return this._packetForwarder.sendUplink(message);
        }
        return undefined;
    }
    close(){
        this._packetForwarder.close();
    }
}
exports.Gateway = Gateway;