export interface IModule {
  exists: boolean
  query: string
  path: string
  main: string
  name: string
  version: string
  dependencies: string[]
  error?: Error
}

export type IResolvedFileType = 'file' | 'directory' | null
export interface IFsPathType {
  path: string
  type: IResolvedFileType
}

export interface IResolveOptions {
  callerPath?: string
  moduleDirs?: string[]
}

// Yarn PnP API
// @see https://yarnpkg.com/api/modules/yarnpkg_pnp.html
interface PnpResolveToUnqualifiedOptions {
  considerBuiltins?: boolean
}
interface PnpResolveUnqualifiedOptions {
  extensions?: string[]
  conditions?: Set<string>
}
type PnpResolveRequestOptions = PnpResolveToUnqualifiedOptions & PnpResolveUnqualifiedOptions
export interface PnpApi {
  resolveRequest: (
    request: string,
    issuer: string | null,
    options?: PnpResolveRequestOptions
  ) => string | null
}

// UNUSED DEFS FOR PnpApi
// These parts mostly for reusing of other packages
// getPackageInformation: (locator: IPackageLocator) => PackageInformation
// resolveToUnqualified: (
//   request: string,
//   issuer: string | null,
//   options?: PnpResolveToUnqualifiedOptions
// ) => string | null
// resolveUnqualified: (
//   unqualifiedRequest: string,
//   options?: PnpResolveUnqualifiedOptions
// ) => string
// setup: () => void
// getLocator: (name: string, referencish: string | [string, string]) => IPhysicalPackageLocator
// findPackageLocator: (location: string) => IPhysicalPackageLocator | null
// }

// interface IPhysicalPackageLocator {
//   name: string
//   reference: string
// }
// interface ITopLevelPackageLocator {
//   name: null
//   reference: null
// }
// type IPackageLocator = IPhysicalPackageLocator | ITopLevelPackageLocator
// enum PackageLinkType {
//   HARD = 'HARD',
//   SOFT = 'SOFT'
// }
// type PackageDependencyTarget = string | string[] | null // name | aliases | missing peer dependency
// interface PackageInformation {
//   packageLocation: string
//   packageDependencies: Map<string, PackageDependencyTarget>
//   packagePeers: Set<string>
//   linkType: PackageLinkType
//   discardFromLookup: boolean
// }
