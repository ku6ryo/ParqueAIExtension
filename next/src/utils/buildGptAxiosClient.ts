import { Axios } from "axios"
import { envVar } from "./EnvVarManager"

export function buildGptAxiosClient() {
  const secret = envVar.getOpenAISecret()
  if (!secret) {
    throw new Error("OpenAI secret is not set")
  }
  return new Axios({
    baseURL: "https://api.openai.com/v1/",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${secret}`
    }
  })
}