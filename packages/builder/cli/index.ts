import App from '../src/App'

const main = (args: any) => {
  const app = new App()

  app.parse(args)
}

main(process.argv)
