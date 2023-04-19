import React, { MouseEventHandler, useEffect, useRef, useState } from "react"
import * as styles from "./style.module.scss"

type Message = {
  timestamp: number
  speaker: string
  text: string
}

const orders = [
  "箇条書きで要約してください。",
  "アクションアイテムをリスト化してください"
]

const chunkPeriods = [{
  label: "3分",
  period: 1000 * 60 * 3,
}, {
  label: "5分",
  period: 1000 * 60 * 5,
}, {
  label: "10分",
  period: 1000 * 60 * 10,
}, {
  label: "20分",
  period: 1000 * 60 * 20,
}, {
  label: "30分",
  period: 1000 * 60 * 30,
}, {
  label: "40分",
  period: 1000 * 60 * 40,
}, {
  label: "50分",
  period: 1000 * 60 * 50,
}]

export function Dialog() {

  const [result, setResult] = useState("")
  const messagesRef = useRef<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [_, setLastTimestamp] = useState(0)
  const [chunkPeriod, setChunkPeriod] = useState(1000 * 60 * 5)
  const lastFetchPerfTimeRef = useRef(0)

  useEffect(() => {
    setInterval(() => {
      callGpt("hoge")
    }, 30 * 1000)
  }, [])

  useEffect(() => {
    setInterval(() => {
      const elements = document.querySelectorAll('[aria-label="message item"]');
      const newMessages = [] as Message[]
      for (const e of elements) {
        const element = e as HTMLElement
        if (element.dataset.done) {
          continue
        }
        const timeContainer = element.querySelector(".pt-3 .ml-2")
        if (!timeContainer) {
          throw new Error("time container not found")
        }
        const time = timeContainer.textContent || ""
        const [hh, mm, ss] = time.split(":").map(s => parseInt(s, 10))
        const speakerContainer = element.querySelector(".pt-3 .ml-2.font-medium")
        if (!speakerContainer) {
          throw new Error("speaker container not found")
        }
        const speaker = speakerContainer.textContent || ""
        const textContainer = element.querySelector('[aria-label="message body"]')
        if (!textContainer) {
          throw new Error("text container not found")
        }
        const text = textContainer.textContent || ""
        const date = new Date()
        date.setHours(hh)
        date.setMinutes(mm)
        date.setSeconds(ss)
        const timestamp = date.getTime()
        element.dataset.done = "true"
        newMessages.push({ timestamp, speaker, text })
      }
      messagesRef.current = [...messagesRef.current, ...newMessages]
      setLastTimestamp(new Date().getTime())
    }, 1000)
  }, [])

  const callGpt = async (order: string) => {
      setLoading(true)
      try {
        const res = await fetch("http://localhost:3000/api/callGpt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order,
            entries: messagesRef.current.filter(m => m.timestamp > new Date().getTime() - chunkPeriod)
          }),
        })
        const json = await res.json()
        console.log(json)
        setResult(json.result)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
  }
  const onButtonClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
    const order = e.currentTarget.dataset.order
    if (!order) {
      throw new Error("order not found")
    }
    callGpt(order)
  }
  const periodSelectionChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    setChunkPeriod(parseInt(e.currentTarget.value, 10))
  }
  const messages = messagesRef.current
  return (
    <div className={styles.frame}>
      <div>total messages: {messages.length}</div>
      <div>
        <select value={chunkPeriod} onChange={periodSelectionChange}>
          {chunkPeriods.map(({ label, period }) => (
            <option value={period}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <textarea readOnly value={result} disabled={loading}></textarea>
      </div>
      <div>
        {orders.map(order => (
          <button onClick={onButtonClick} disabled={loading} data-order={order}>{order}</button>
        ))}
      </div>
    </div>
  )
}