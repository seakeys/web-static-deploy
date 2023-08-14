const os = require('os');
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const Client = require("ssh2").Client;

const conn = new Client();

let totalFilesUploaded = 0;
let totalLocalFiles = 0;

const formatBytes = (bytes) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
};

const uploadFile = (sftp, localFilePath, remoteFilePath) => {
  return new Promise((resolve, reject) => {
    const localFileStream = fs.createReadStream(localFilePath);
    const remoteWriteStream = sftp.createWriteStream(remoteFilePath);

    const stat = fs.statSync(localFilePath);
    let uploadedBytes = 0;

    localFileStream.on("data", (chunk) => {
      uploadedBytes += chunk.length;
      const progress = (uploadedBytes / stat.size) * 100;
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(
        chalk.green(
          `Uploading ${path.basename(localFilePath)} - ${progress.toFixed(2)}%`
        )
      );
    });

    localFileStream.pipe(remoteWriteStream);

    remoteWriteStream.on("close", () => {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      console.log(
        chalk.green(
          `Uploaded: ${path.basename(remoteFilePath)} (${formatBytes(
            stat.size
          )})`
        )
      );
      totalFilesUploaded++;
      resolve();
    });

    remoteWriteStream.on("error", (err) => {
      reject(err);
    });
  });
};

const createRemoteDirectory = (sftp, remoteDirPath) => {
  return new Promise((resolve, reject) => {
    sftp.mkdir(remoteDirPath, (err) => {
      if (err) {
        if (err.code !== 4) {
          reject(err);
        } else {
          resolve(); // Directory already exists
        }
      } else {
        resolve();
      }
    });
  });
};

const traverseAndUpload = async (sftp, localDir, remotePath) => {
  const files = fs.readdirSync(localDir);

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const localFilePath = path.join(localDir, file);
    const remoteFilePath = path.join(
      remotePath,
      path.relative(localDir, localFilePath)
    );
    const isDirectory = fs.statSync(localFilePath).isDirectory();

    if (isDirectory) {
      await createRemoteDirectory(sftp, remoteFilePath);
      await traverseAndUpload(sftp, localFilePath, remoteFilePath);
    } else {
      await uploadFile(sftp, localFilePath, remoteFilePath);
      totalLocalFiles++;
    }
  }
};

const checkIfExists = (sftp, path) => {
  return new Promise((resolve, reject) => {
    sftp.exists(path, (value) => resolve(value))
  })
}

function webStaticDeploy(options) {
  options.port = options.port || "22";

  const sshKeyPath = options.privateKeyPath || path.join(os.homedir(), '.ssh', 'id_rsa');
  options.privateKey = fs.readFileSync(sshKeyPath).toString()

  console.log(`Deploying on host ${options.host} -p ${options.port}`);
  console.log(`Upload from [${options.localPath}] to [${options.remotePath}]`);
  console.log(`Uploading file...`);

  conn.on("ready", async () => {

    conn.sftp(async (err, sftp) => {
      if (err) throw err;

      const isRemotePathExists = await checkIfExists(sftp, options.remotePath);

      if (!isRemotePathExists) await createRemoteDirectory(sftp, options.remotePath);

      await traverseAndUpload(sftp, options.localPath, options.remotePath);

      console.log(`Local files: ${totalLocalFiles}`);

      console.log(`Uploaded files: ${totalFilesUploaded}`);

      console.log("Deployment completed successfully!");

      conn.end(); // Close the SSH connection
    });
  });

  conn.on("error", (err) => {
    console.error("An error occurred:", err.message);
  });

  conn.connect({
    host: options.host,
    port: options.port,
    username: options.username,
    privateKey: options.privateKey,
  });
}

module.exports = webStaticDeploy;