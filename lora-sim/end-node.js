var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndNode = void 0;
const lora_packet_1 = __importDefault(require("lora-packet"));

class EndNode {
    constructor(devAddr, nwkKey, appKey, gateway) {
        this._frameCnt = 0;
        this._devAddr = devAddr;
        this._nwkKey = nwkKey;
        this._appKey = appKey;
        this._gateway = gateway;
    }
    sendPacket(data, frameCnt, ts, sfreq, sDatr, schan, srfch) {
        this._frameCnt = frameCnt;
        var packet = this._generateLoRaPacket(data);
        return this._gateway.sendUplink(packet, ts, sfreq, sDatr, schan, srfch);
    }
    _generateLoRaPacket(data) {
        let packet = lora_packet_1.default.fromFields({
            MType: "Unconfirmed Data Up",
            DevAddr: this._devAddr,
            FCtrl: {
                ADR: false,
                ACK: false,
                ADRACKReq: false,
                FPending: false,
            },
            FPort: 1,
            FCnt: this._frameCnt++,
            payload: data
        }, this._appKey, this._nwkKey);
        return packet;
    }
}
exports.EndNode = EndNode;