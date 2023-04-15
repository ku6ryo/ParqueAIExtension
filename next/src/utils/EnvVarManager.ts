
class EnvVarManager {

    constructor() {}

    private get(envVarName: string) {
      return process.env[envVarName]
    }

    getNotionSecret() {
      return this.get('NOTION_SECRET')
    }

    getOpenAISecret() {
      return this.get('OPENAI_SECRET')
    }
}

export const envVar = new EnvVarManager()