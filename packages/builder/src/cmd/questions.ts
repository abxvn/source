import type { CheckboxQuestionOptions, ConfirmQuestionOptions } from 'inquirer'
import inquirer from 'inquirer'

interface CheckBoxOptions extends Omit<CheckboxQuestionOptions, 'choices'> {
  choices: string[]
}
export const components: CheckBoxOptions = {
  message: 'Select components to install',
  type: 'checkbox',
  choices: ['webpack', 'typescript', 'eslint', 'jest'],
  default: ['webpack', 'typescript']
}
export type IComponentAnswer = string[]

export const sdk: ConfirmQuestionOptions = {
  message: 'Install VSCode Yarn SDK?',
  type: 'confirm',
  default: true
}
export type ISdkAnswer = boolean

export const editorConfigs: ConfirmQuestionOptions = {
  message: 'Copy editconfig, git config files?',
  type: 'confirm',
  default: true
}
export type IEditorConfigsAnswer = boolean

const allQuestions: any = {
  components,
  sdk,
  editorConfigs
}

type IAskQuestionName = keyof typeof allQuestions
type IAskQuestions = Record<string, typeof allQuestions[IAskQuestionName]>
export const ask = async <T>(questions: IAskQuestions): Promise<T> => {
  const answers = await inquirer.prompt(
    Object.keys(questions).map(name => ({
      ...allQuestions[name],
      name
    }))
  )

  return answers
}
