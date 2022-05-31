# web-static-deploy

Automatically deploy local static resources to the server.

## Install

```js
npm install web-static-deploy
```
## Examples

**1. Create  webStaticDeploy.js in the root directory**

```js
const webStaticDeploy = require('web-static-deploy')
webStaticDeploy(options)
```
The options can contain:

- destination
  - host: server ip address.
  - username: Username for authentication. Example: ("root")
  - port: Port number of the server. Default: 22
  - privateKeyPath: Local client private key address. Example: ("c:/Users/Lenovo/.ssh/id_rsa")
  - localPath: Local file path to upload. Example: ("./dist/")
  - remotePath: The address where the file is uploaded to the server. Example: ("/var/www/test")
  
**2. Add in package.json  **

```js
  "scripts": {
    "deploy": "node ./webStaticDeploy.js"
  }
```