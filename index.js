const chalk = require('chalk'); // v4.0.0
const scp2 = require('./src/scp');
const fs = require('fs');
const path = require('path');
const ProgressBar = require('progress');

function webStaticDeploy(options) {
    options.port = options.port || '22'
    options.privateKey = fs.readFileSync(options.privateKeyPath).toString()

    console.log(`--> Deploying on host ${options.host} -p ${options.port}
--> Upload from [${options.localPath}] to [${options.remotePath}]
--> Uploading file...`)

    var client = new scp2.Client({
        host: options.host,
        username: options.username,
        port: options.port,
        privateKey: options.privateKey,
    });

    var bar
    client.on('transfer', (buffer, curr, total, options) => {
        const size = chalk.green(`${formatBytes(options.attrs.size)}`)

        if (!curr) {
            bar = new ProgressBar(`${chalk.green('✔')} ${path.basename(options.source)} :size :percent`, { total: total - 1 })
            if (total === 1) bar.tick({ 'size': size })
        } else {
            bar.tick({ 'size': size })
        }
    });

    scp2.scp(options.localPath, {
        host: options.host,
        username: options.username,
        port: options.port,
        privateKey: options.privateKey,
        path: options.remotePath
    }, client, err => {
        if (!err) {
            console.log(`--> successfully deployed`)
        } else {
            console.log(`--> faile deployed`)
            console.log("err", err)
        }
        client.close()
    })
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = webStaticDeploy