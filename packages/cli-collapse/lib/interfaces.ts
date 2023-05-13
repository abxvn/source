export interface ICollapser {
  write: (message: string) => void
  expand: () => void
  collapse: (clean?: boolean) => void
}
