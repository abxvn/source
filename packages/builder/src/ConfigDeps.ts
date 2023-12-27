import type {
  IConfigDeps,
  IConfigDepsSetData,
  IDep,
  IDepWithDeps,
} from './interfaces'

export default class ConfigDeps implements IConfigDeps {
  private readonly unsetDepNames: string[] = []
  private readonly deps: Record<string, IDepWithDeps> = {}

  get dependencies () {
    const mergedDeps = Object.keys(this.deps).reduce<Record<string, IDep>>((deps, name) => {
      const { version, dependencies, dev } = this.deps[name]

      if (!version || this.unsetDepNames.includes(name)) {
        return deps
      }

      deps[name] = {
        ...deps[name], // if exists, update with new version and dev indicator
        version,
        dev: deps[name]?.dev ?? dev, // obey previous dev
      }

      dependencies?.forEach(({ name, version, dev: dependencyDev }) => {
        if (!version || this.unsetDepNames.includes(name)) {
          return
        }

        deps[name] = {
          ...deps[name], // if exists, update with new version and dev indicator
          version,
          dev: deps[name]?.dev ?? dependencyDev ?? dev, // obey previous dev, or use main package dev if not set
        }
      })

      return deps
    }, {})

    return Object.keys(mergedDeps).reduce<string[]>((installs, name) => {
      const { version, dev } = mergedDeps[name]

      if (dev) {
        installs.push(`dev//${name}@${version}`)
      } else {
        installs.push(`${name}@${version}`)
      }

      return installs
    }, [])
  }

  requires (name: string) {
    return Boolean(this.get(name)?.version)
  }

  set (name: string, data: IConfigDepsSetData) {
    let dep = this.get(name)

    if (dep) {
      // apply new data
      dep = {
        ...this.deps[name],
        ...data,
      }

      this.deps[name] = dep
    } else {
      const { version = '*', dependencies, dev } = data

      dep = {
        name,
        version,
        dependencies: dependencies || [],
        dev: dev ?? false,
      }
    }

    this.deps[name] = dep

    return dep
  }

  get (name: string): IDepWithDeps | undefined {
    return this.deps[name]
  }

  unset (name: string) {
    this.unsetDepNames.push(name)
  }
}
