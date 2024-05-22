import { Locker } from "./utils/locker";
import { httpRequests } from "./utils/httpRequests";

class PhoneWorker {
    locker: Locker;
    ip: string;
    constructor(ip: string) {
        this.ip = ip;
        this.locker = new Locker();
        this.locker.id = ip;
    }

    async banNumber(number: string) {
        let token: string = null;
        let result = true;

        {
            let data: any = {
                'username': 'admin',
                'password': 'Admin2023!'
            };

            let stringData = new URLSearchParams(data).toString()

            let res = await httpRequests.request({
                method: 'post',
                host: this.ip,
                path: '/cgi-bin/dologin',//'/app/xml_cdr/xml_cdr.php?' + querystring.stringify(Filter),
                timeout: 10000,
                headers: {
                    Referer: `http://${this.ip}/`,
                    Origin: `http://${this.ip}/`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    "content-length": stringData.length,
                    cookie: 'HttpOnly',
                    'Accept': '*/*'
                }
            }, stringData);

            const auth = JSON.parse(res.data);
            if (!auth.body || auth.response != 'success' || !auth.body.sid) {
                console.log('failed auth', auth)
                result = false;
            } else {
                token = auth.body.sid;
            }
        }

        if (token) {
            const data = {
                'stamp': '69812850',
                'id': '-1',
                'lastname': '',
                'firstname': number,
                'workNum': '',
                'homeNum': '',
                'cellNum': number,
                'Company': '',
                'Department': '',
                'Job': '',
                'JobTitle': '',
                'primary': '2',
                'favorite': '0',
                'account': '1',
                'groups': '4',
                'sid': token
            }
            const stringData = new URLSearchParams(data).toString()
            const res = await httpRequests.request({
                method: 'post',
                host: this.ip,
                path: '/cgi-bin/api-save_contact',//'/app/xml_cdr/xml_cdr.php?' + querystring.stringify(Filter),
                timeout: 10000,
                headers: {
                    Referer: `http://${this.ip}/`,
                    Origin: `http://${this.ip}/`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    "content-length": stringData.length,
                    cookie: `HttpOnly; session-role=admin; session-identity=${token}; session-identity=${token}`,
                    'Accept': '*/*'
                }
            }, stringData);
            const responceData = JSON.parse(res.data);
            console.log('1', responceData);
            if (responceData.response != 'success') {
                result = false;
            }
        }

        if (token) {
            const data = {
                'stamp': '69812850',
                'id': '-1',
                'lastname': '',
                'firstname': number,
                'workNum': '',
                'homeNum': '',
                'cellNum': number,
                'Company': '',
                'Department': '',
                'Job': '',
                'JobTitle': '',
                'primary': '2',
                'favorite': '0',
                'account': '2',
                'groups': '4',
                'sid': token
            }
            const stringData = new URLSearchParams(data).toString()


            const res = await httpRequests.request({
                method: 'post',
                host: this.ip,
                path: '/cgi-bin/api-save_contact',//'/app/xml_cdr/xml_cdr.php?' + querystring.stringify(Filter),
                timeout: 10000,
                headers: {
                    Referer: `http://${this.ip}/`,
                    Origin: `http://${this.ip}/`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    "content-length": stringData.length,
                    cookie: `HttpOnly; session-role=admin; session-identity=${token}; session-identity=${token}`,
                    'Accept': '*/*'
                }
            }, stringData);

            const responceData = JSON.parse(res.data);
            console.log('2', responceData);
            if ( responceData.response != 'success') {
                result = false;
            }
        }

        console.log('result', result)
        return result;
    }
}

export { PhoneWorker };