import http from 'http';
import { Readable } from 'stream';

class httpRequests {
    static async request(options: http.RequestOptions, body?: string): Promise<{ headers: http.IncomingHttpHeaders, data: string, statusCode: number }> {
        return new Promise((resolve, reject) => {
            let req = http.request(options, (res) => {
                res.setEncoding('utf8');

                let body = '';
                res.on('data', function (chunk) {
                    body = body + chunk;
                });

                res.on('end', function () {
                    resolve({ headers: res.headers, data: body, statusCode: res.statusCode });
                });
            });

            req.on('error', function (e) {
                reject(e);
            });

            if (body) {
                req.write(body);
            }
            req.end();
        });
    }

    static async requestStream(options: http.RequestOptions, body?: string): Promise<{ headers: http.IncomingHttpHeaders, statusCode: number, stream: Readable }> {
        const stream = new Readable({ highWaterMark: 1024 * 1024 });
        stream._read = () => { };
        return new Promise((resolve, reject) => {
            let req = http.request(options, (res) => {
                resolve({ headers: res.headers, stream: stream, statusCode: res.statusCode })

                res.on('data', function (chunk) {
                    stream.push(chunk); //?
                });

                res.on('end', function () {
                    stream.push(null); //?
                });
            });

            req.on('error', function (e) {
                reject(e);
            });

            if (body) {
                req.write(body);
            }
            req.end();
        });
    }
}

export { httpRequests };