import axios from "axios"
import { envVar } from "./EnvVarManager"
import FormData from "form-data"
import { createReadStream } from "fs"


export async function callWhisper(filePath: string) {
  const secret = envVar.getOpenAISecret()
  const fd = new FormData()
  fd.append('file', createReadStream(filePath));
  fd.append("model", "whisper-1")
  const axiosInstance = axios.create({
    headers: {
      ...fd.getHeaders(),
      "Authorization": `Bearer ${secret}`,
    }
  })
  try {
    const res = await axiosInstance.post("https://api.openai.com/v1/audio/transcriptions", fd)
    return res
  } catch (e) {
    console.error((e as any).response)
    throw e
  }
}