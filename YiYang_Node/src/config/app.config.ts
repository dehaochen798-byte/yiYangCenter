import { LocalEnvConfigCenter } from '../libs/config-center/local-env-config-center.js'

const configCenter = new LocalEnvConfigCenter()

export default () => ({
  port: configCenter.getGatewayHttpConfig().port,
  jwtSecret: configCenter.getJwtConfig().secret,
  jwtExpiresIn: configCenter.getJwtConfig().expiresIn,
  databaseUrl: configCenter.getDatabaseConfig().url,
})
