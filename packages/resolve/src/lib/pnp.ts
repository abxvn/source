import type { PnpApi } from '../interfaces'

const getPnpApi = (): PnpApi | null => {
  try {
    if (!process.versions.pnp) { // pnp setup should be run
      return null
    }

    return require('pnpapi')
  } catch (err: any) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      throw err
    }

    return null
  }
}

export const pnpApi = getPnpApi()
export const isPnpEnabled = () => pnpApi !== null
