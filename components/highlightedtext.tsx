import type React from "react"

interface HighlightedTextProps {
  text: string
  searchWord: string
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, searchWord }) => {
  if (!searchWord.trim()) {
    return <span>{text}</span>
  }

  const regex = new RegExp(`(${searchWord})`, "gi")
  const parts = text.split(regex)

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  )
}

export default HighlightedText

