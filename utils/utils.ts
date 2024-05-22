import { Api } from "telegram";

const wait = (timer: number) => {
    return new Promise((res) => {
        setTimeout(() => {
            res(true);
        }, timer);
    });
};

const getPeerId = (peer: Api.TypePeer) => {
    if(peer.className =='PeerChannel'){
        return peer.channelId.toString();
    }
    if(peer.className =='PeerChat'){
        return peer.chatId.toString();
    }
    if(peer.className =='PeerUser'){
        return peer.userId.toString();
    }

}

export { wait,getPeerId };