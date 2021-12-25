const webStaticDeploy = require('./index')

webStaticDeploy({
  host: '',
  username: 'root',
  privateKeyPath: 'c:/Users/Lenovo/.ssh/id_rsa',
  localPath: './dist/',
  remotePath: '/var/www/demo'
})