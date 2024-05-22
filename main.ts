import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import input from 'input';
import config from "./config";
import { PhoneWorker } from "./phoneWorker";
import { getPeerId, wait } from "./utils/utils";



const apiId = 157840;
const apiHash = "fb312875319b91cb152aa4e4a0231584";
const stringSession = new StringSession(config.TG.tgSession);
const data = {
    myId: ''
};
const phones: { [key: string]: PhoneWorker } = {};

(async () => {
    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    await client.start({
        phoneNumber: async () => await config.TG.Number,
        password: async () => await input.text("Please enter your password: "),
        phoneCode: async () =>
            await input.text("Please enter the code you received: "),
        onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    console.log("Save session string into config, seesion string is:")
    console.log(client.session.save());
    let me = await client.getMe();
    data.myId = me.id.toString();

    if (!config.TG.chatID) {
        console.log('Chat not selected, type chat id into config. Avaliable chats:');
        let diags = await client.getDialogs();
        for (let x of diags) {
            console.log(x.id.toString(), x.title)
        }

        await wait(5000);//waiting logs displayed in the terminal
        process.exit();
        return;
    }

    if (Object.keys(config.userPhones).length == 0) {
        console.log("No phones assigned to users, select from the list:");
        let users = await client.getParticipants(config.TG.chatID)
        for (let x of users) {
            console.log(x.id.toString(), x.firstName, x.lastName, x.username);
        }

        await wait(5000);//waiting logs displayed in the terminal
        process.exit();
        return;
    } else {
        for (let x of Object.keys(config.userPhones)) {
            let ip = config.userPhones[x];
            if (!phones[ip]) {
                phones[ip] = new PhoneWorker(ip);
            }
        }
    }


    await client.addEventHandler(async (update: Api.TypeUpdate) => {
        try {
            // if(update.className == '')
            // console.log("Received new Update")
            //console.log(update);

            if (update.className == "UpdateMessageReactions") {
                const chatId = getPeerId(update.peer);
                const msgId = update.msgId;
                //console.log(update.reactions);
                for (let x of update.reactions.recentReactions) {
                    //console.log(x);
                    if (x.reaction.className == 'ReactionEmoji') {
                        if (x.reaction.emoticon == '👀' && getPeerId(x.peerId) == data.myId) {
                            console.log('block message');
                            let res = await client.getMessages(update.peer, { ids: [msgId] });
                            for (let x of res) {
                                //console.log(x);
                                if (x.fromId) {
                                    let userId = getPeerId(x.fromId)
                                    let ip = config.userPhones[userId];
                                    if (ip) {
                                        let msg = x.message.replace(/ /g, '')
                                        const number = msg.match('[0-9]{9,}');
                                        if (!number || number.length == 0) {
                                            return;
                                        }

                                        let isBaned = await phones[ip].banNumber(number[0]);

                                        if (isBaned) {
                                            let emotion = new Api.ReactionEmoji({ emoticon: '👍' })
                                            await client.invoke(new Api.messages.SendReaction({
                                                peer: update.peer,
                                                msgId: msgId,
                                                reaction: [emotion]
                                            }));
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }


            // if (update.className == "UpdateEditChannelMessage") {
            //     console.log(1)
            //     if (update.message.className == "Message") {
            //         console.log(2)
            //         if (update.message.peerId.className == 'PeerChannel' && update.message.fromId.className == 'PeerUser') {
            //             console.log(3)
            //             const userId = update.message.fromId.userId.toString();
            //             const chatId = update.message.peerId.channelId.toString();
            //             console.log(update.message.reactions);
            //         }
            //     }
            // }

            return;
        } catch (ex) {
            console.log("eevent handler failed", ex);
        }
    });
})();

// {
//     CONSTRUCTOR_ID: 1328256121,
//     SUBCLASS_OF_ID: 2321221404,
//     className: 'MessageReactions',
//     classType: 'constructor',
//     flags: 6,
//     min: false,
//     canSeeList: true,
//     reactionsAsTags: false,
//     results: [
//       {
//         CONSTRUCTOR_ID: 2748435328,
//         SUBCLASS_OF_ID: 3523792447,
//         className: 'ReactionCount',
//         classType: 'constructor',
//         flags: 0,
//         chosenOrder: null,
//         reaction: [Object],
//         count: 1
//       },
//       {
//         CONSTRUCTOR_ID: 2748435328,
//         SUBCLASS_OF_ID: 3523792447,
//         className: 'ReactionCount',
//         classType: 'constructor',
//         flags: 1,
//         chosenOrder: 0,
//         reaction: [Object],
//         count: 1
//       }
//     ],
//     recentReactions: [
//       {
//         CONSTRUCTOR_ID: 2356786748,
//         SUBCLASS_OF_ID: 2943591077,
//         className: 'MessagePeerReaction',
//         classType: 'constructor',
//         flags: 0,
//         big: false,
//         unread: false,
//         my: false,
//         peerId: [Object],
//         date: 1716302328,
//         reaction: [Object]
//       },
//       {
//         CONSTRUCTOR_ID: 2356786748,
//         SUBCLASS_OF_ID: 2943591077,
//         className: 'MessagePeerReaction',
//         classType: 'constructor',
//         flags: 0,
//         big: false,
//         unread: false,
//         my: false,
//         peerId: [Object],
//         date: 1716297072,
//         reaction: [Object]
//       }
//     ]
//   }
//   {
//     CONSTRUCTOR_ID: 1328256121,
//     SUBCLASS_OF_ID: 2321221404,
//     className: 'MessageReactions',
//     classType: 'constructor',
//     flags: 6,
//     min: false,
//     canSeeList: true,
//     reactionsAsTags: false,
//     results: [
//       {
//         CONSTRUCTOR_ID: 2748435328,
//         SUBCLASS_OF_ID: 3523792447,
//         className: 'ReactionCount',
//         classType: 'constructor',
//         flags: 0,
//         chosenOrder: null,
//         reaction: [Object],
//         count: 1
//       }
//     ],
//     recentReactions: [
//       {
//         CONSTRUCTOR_ID: 2356786748,
//         SUBCLASS_OF_ID: 2943591077,
//         className: 'MessagePeerReaction',
//         classType: 'constructor',
//         flags: 0,
//         big: false,
//         unread: false,
//         my: false,
//         peerId: [Object],
//         date: 1716297072,
//         reaction: [Object]
//       }
//     ]
//   }


// {
//     CONSTRUCTOR_ID: 1578843320,
//     SUBCLASS_OF_ID: 2676568142,
//     className: 'UpdateMessageReactions',
//     classType: 'constructor',
//     flags: 0,
//     peer: {
//       CONSTRUCTOR_ID: 2728736542,
//       SUBCLASS_OF_ID: 47470215,
//       className: 'PeerChannel',
//       classType: 'constructor',
//       channelId: Integer { value: 1969662998n }
//     },
//     msgId: 4226,
//     topMsgId: null,
//     reactions: {
//       CONSTRUCTOR_ID: 1328256121,
//       SUBCLASS_OF_ID: 2321221404,
//       className: 'MessageReactions',
//       classType: 'constructor',
//       flags: 6,
//       min: false,
//       canSeeList: true,
//       reactionsAsTags: false,
//       results: [ [Object] ],
//       recentReactions: [ [Object] ]
//     }
//   }
//   Received new Update
//   {
//     CONSTRUCTOR_ID: 457133559,
//     SUBCLASS_OF_ID: 2676568142,
//     className: 'UpdateEditChannelMessage',
//     classType: 'constructor',
//     message: {
//       CONSTRUCTOR_ID: 592953125,
//       SUBCLASS_OF_ID: 2030045667,
//       className: 'Message',
//       classType: 'constructor',
//       out: false,
//       mentioned: false,
//       mediaUnread: false,
//       silent: false,
//       post: false,
//       fromScheduled: false,
//       legacy: false,
//       editHide: true,
//       ttlPeriod: null,
//       id: 4226,
//       fromId: {
//         CONSTRUCTOR_ID: 1498486562,
//         SUBCLASS_OF_ID: 47470215,
//         className: 'PeerUser',
//         classType: 'constructor',
//         userId: [Integer]
//       },
//       peerId: {
//         CONSTRUCTOR_ID: 2728736542,
//         SUBCLASS_OF_ID: 47470215,
//         className: 'PeerChannel',
//         classType: 'constructor',
//         channelId: [Integer]
//       },
//       fwdFrom: null,
//       viaBotId: null,
//       replyTo: null,
//       date: 1716301074,
//       message: '48793431297\nадам сьогодні',
//       media: null,
//       replyMarkup: null,
//       entities: null,
//       views: null,
//       forwards: null,
//       replies: {
//         CONSTRUCTOR_ID: 2211844034,
//         SUBCLASS_OF_ID: 1825397986,
//         className: 'MessageReplies',
//         classType: 'constructor',
//         flags: 4,
//         comments: false,
//         replies: 1,
//         repliesPts: 4624,
//         recentRepliers: null,
//         channelId: null,
//         maxId: 4227,
//         readMaxId: null
//       },
//       editDate: 1716301348,
//       pinned: false,
//       postAuthor: null,
//       groupedId: null,
//       restrictionReason: null,
//       action: undefined,
//       noforwards: false,
//       reactions: {
//         CONSTRUCTOR_ID: 1328256121,
//         SUBCLASS_OF_ID: 2321221404,
//         className: 'MessageReactions',
//         classType: 'constructor',
//         flags: 4,
//         min: false,
//         canSeeList: true,
//         reactionsAsTags: false,
//         results: [],
//         recentReactions: null
//       },
//       flags: 11567360,
//       invertMedia: false,
//       flags2: 0,
//       offline: false,
//       fromBoostsApplied: null,
//       savedPeerId: null,
//       viaBusinessBotId: null,
//       quickReplyShortcutId: null
//     },
//     pts: 4625,
//     ptsCount: 1
//   }