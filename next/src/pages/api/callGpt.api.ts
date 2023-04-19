import { buildGptAxiosClient } from "../../utils/buildGptAxiosClient"
import type { NextApiRequest, NextApiResponse } from 'next'
import Cors from 'cors'

type GptMessage = {
  role: "user" | "system" | "assistant"
  content: string
}

async function callChatCompletion(messages: GptMessage[]): Promise<string> {
  const axios = buildGptAxiosClient()
  const res = await axios.post("/chat/completions", JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: messages,
    temperature: 0,
  }))
  const data = JSON.parse(res.data)
  return data.choices.map((choice: any) => choice.message.content).join("\n")
}

const systemMessage: GptMessage = {
  role: "system",
  content: ``,
}

// Initializing the cors middleware
// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

type Data = {
  result: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await runMiddleware(req, res, cors)
  const { entries, order } = req.body
  const timeline = (() => {
    try {
      if (!Array.isArray(entries)) {
        throw new Error("entries is not array")
      }

      entries.forEach(ent => {
        if (typeof ent !== 'object') {
          throw new Error('entry is not object')
        }
        if (typeof ent.timestamp !== "number") {
          throw new Error('entry.timestamp is not number')
        }
        if (typeof ent.speaker !== "string") {
          throw new Error('entry.speaker is not number')
        }
        if (typeof ent.text !== 'string') {
          throw new Error('entry.text is not string')
        }
      })
      return entries.map(ent => `${ent.text}`).join("\n\n")
      return entries.map(ent => `時間: ${new Date(ent.timestamp).toISOString()}, 話し手: ${ent.speaker}, 内容: ${ent.text}`).join("\n")
    } catch (e) {
      if (e instanceof Error) {
        res.status(400).json({ result: e.message })
        return
      } else {
        res.status(500).json({ result: 'unknown error' })
        return
      }
    }
  })()
  if (!timeline) {
    res.status(500).json({ result: 'unknoewn error' })
    return
  }

  const result = await callChatCompletion([{
      role: "system",
      content: `
        あなたはミーティングの進行を手助けする AI アシスタントです。
        user からの入力は、複数のミーティングの参加者が発言した内容を、時間順に並べたものです。

        指示内容:
        * 内容を箇条書きで時系列でリストとして書き出してください。
        * 話していることをそのまま描きだすのではなく、話されている内容をまとまった単位で要約して項目としてください。
        * 相槌は省いてください。相槌とは、OK、了解などです。
        * 書き出し結果に誤りがある可能性があるので、前後の文脈をみて意味の通じるものだけを抜き出してください。
        * ミーティングノートに使えるような形式で書き出してください。
        * 一つ一つの発言ではなく、まとまった単位で要約してください。

        ルール:
        * 発言者が発言した内容をそのまま書き出さないこと
        * 与えられた日付をそのまま表示しない
        
        フォーマット:
        * マークダウン形式で書き出してください
      `,
    },
    {
    role: "user",
    content: timeline,
  }])
  res.status(200).json({ result, })
}