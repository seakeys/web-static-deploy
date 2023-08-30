# web-static-deploy

Automate the deployment of local static resources to a remote server.

## Installation

To install the package, use the following command:

```js
npm install web-static-deploy
```

## Usage

1. Create a file named webStaticDeploy.js in the root directory of your project.

```js
const webStaticDeploy = require('web-static-deploy')
webStaticDeploy(options)
```

The options object can include the following properties:

- `destination`
  - `host`: The IP address of the server.
  - `username`: The authentication username (e.g., "root").
  - `port`(optional): The port number of the server. Default is 22.
  - `privateKeyPath`(optional): The local path to the client's private key. If not specified, the system's default SSH key at "ssh/id_rsa" will be used.
  - `localPath`: The local file path to the resources you want to upload (e.g., "dist").
  - `remotePath`: The destination path on the server where the files will be uploaded (e.g., "/var/www/***").
  
2. Add a deployment script to your package.json:

```js
  "scripts": {
    "deploy": "node webStaticDeploy.js"
  }
```

Now you can run the deployment script using:

```js
  npm run deploy
```

Make sure you've configured the options object in your webStaticDeploy.js file according to your server settings and project structure. This setup will help you automate the process of deploying static resources to your remote server.