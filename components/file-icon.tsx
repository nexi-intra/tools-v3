import type React from "react"
import {
  AiFillFile,
  AiFillFileImage,
  AiFillFileText,
  AiFillFilePdf,
  AiFillFileExcel,
  AiFillFileWord,
  AiFillFileZip,
  AiFillHtml5,
  AiFillFileMarkdown,
} from "react-icons/ai"

// Function to get file extension
const getFileExtension = (filename: string | undefined): string => {
  if (!filename) return ""
  const parts = filename.split(".")
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ""
}

// Map file extensions to icons
const iconMap: { [key: string]: React.ElementType } = {
  txt: AiFillFileText,
  pdf: AiFillFilePdf,
  doc: AiFillFileWord,
  docx: AiFillFileWord,
  xls: AiFillFileExcel,
  xlsx: AiFillFileExcel,
  png: AiFillFileImage,
  jpg: AiFillFileImage,
  jpeg: AiFillFileImage,
  gif: AiFillFileImage,
  zip: AiFillFileZip,
  rar: AiFillFileZip,
  html: AiFillHtml5,
  md: AiFillFileMarkdown,
}

interface FileIconProps {
  filename: string | undefined
  className?: string
}

const FileIcon: React.FC<FileIconProps> = ({ filename, className = "" }) => {
  const extension = getFileExtension(filename)
  const IconComponent = iconMap[extension] || AiFillFile

  return <IconComponent className={`w-6 h-6 ${className}`} />
}

export default FileIcon

// Example usage
const ExampleUsage: React.FC = () => {
  const files = [
    "document.txt",
    "image.png",
    "spreadsheet.xlsx",
    "presentation.pptx",
    "archive.zip",
    "webpage.html",
    "unknown.xyz",
    undefined, // Add an undefined filename to test error handling
  ]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">File Icon Examples</h1>
      <div className="grid grid-cols-2 gap-4">
        {files.map((file, index) => (
          <div key={index} className="flex items-center space-x-2">
            <FileIcon filename={file} />
            <span>{file || "Undefined filename"}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export { ExampleUsage }

