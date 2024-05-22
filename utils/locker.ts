import { Logger } from "./logger";

const logLocation = 'Locker';
class Locker {
    id: string = 'any';
    forceUnlockTimeout = 5 * 1000;
    forceUnlockTimer: NodeJS.Timeout;
    locked = false;
    lockerId: number = 0;
    awaiters: Function[] = [];

    unlock(lockerId: number) {
        if (this.lockerId != lockerId) {
            Logger.error(logLocation, 'Invalid key trying to ulock resource', { id: this.id, lockerId });
            return;
        }


        if (this.locked) {
            this.locked = false;
            Logger.debug(logLocation, 'Locker unlocked', { thread: this.id, lockerId: this.lockerId, awaiters: this.awaiters.length });
            if (this.forceUnlockTimer) {
                clearTimeout(this.forceUnlockTimer);
            }
            this.startFunc();
        }
    }

    startFunc() {
        if (!this.locked && this.awaiters.length > 0) {
            let fn = this.awaiters.shift()
            fn();

            this.forceUnlockTimer = setTimeout(() => {
                if (this.locked == false) {
                    this.locked = false;
                    this.startFunc();
                    Logger.error(logLocation, 'Locker was forcibly unlocked', { id: this.id, awaiters: this.awaiters.length });
                }
            }, this.forceUnlockTimeout)

        }
    }

    async waitToken(): Promise<number> {
        let pr = new Promise<number>((res, rej) => {
            this.awaiters.push(() => {
                this.locked = true;
                this.lockerId = this.lockerId + 1;

                Logger.debug(logLocation, 'Locker locked', { thread: this.id, lockerId: this.lockerId, awaiters: this.awaiters.length });
                if (this.lockerId > 50) {
                    this.lockerId = 0;
                }

                res(this.lockerId);
            });
            this.startFunc();
        });

        return await pr;
    }
}

export { Locker };