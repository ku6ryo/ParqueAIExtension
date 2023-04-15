import axios from "axios"

type GptMessage = {
  role: "user" | "assistant"
  content: string
}

export class ApiClient {
  async callTen(messages: GptMessage[]) {
    const res = await axios.post("/api/callTen", {
      messages,
    })
    return res.data.result
  }
}