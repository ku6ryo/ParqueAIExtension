import React from "react"
import { Dialog } from "./Dialog"
import { createRoot } from "react-dom/client"
console.log("Hello, AI assistant loaded.")
console.log("v: 0.0.3")

const container = document.createElement("div")
container.style.position = "fixed"
container.style.right = "0"
container.style.bottom = "0"
document.body.appendChild(container)

createRoot(container).render(<Dialog />)