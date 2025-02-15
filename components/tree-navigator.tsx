'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react'

const treeData: TreeNodeProps['node'][] = [
  {
    name: 'Documents',
    type: 'folder',
    children: [
      {
        name: 'Project A', type: 'folder', children: [
          { name: 'Report.docx', type: 'file' },
          { name: 'Data.xlsx', type: 'file' },
        ]
      },
      {
        name: 'Project B', type: 'folder', children: [
          { name: 'Presentation.pptx', type: 'file' },
        ]
      },
    ],
  },
  {
    name: 'Images',
    type: 'folder',
    children: [
      { name: 'Logo.png', type: 'file' },
      { name: 'Banner.jpg', type: 'file' },
    ],
  },
]

type TreeNodeProps = {
  node: {
    name: string
    type: 'folder' | 'file'
    children?: TreeNodeProps['node'][]
  }
  level: number
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className="ml-4">
      <div
        className="flex items-center cursor-pointer"
        onClick={toggleOpen}
        style={{ paddingLeft: `${level * 12}px` }}
      >
        {node.type === 'folder' && (
          isOpen ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />
        )}
        {node.type === 'folder' ? (
          <Folder className="h-4 w-4 mr-1" />
        ) : (
          <File className="h-4 w-4 mr-1" />
        )}
        <span>{node.name}</span>
      </div>
      {isOpen && node.children && (
        <div>
          {node.children.map((childNode, index) => (
            <TreeNode key={index} node={childNode} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TreeNavigator() {
  return (
    <div className="text-sm">
      {treeData.map((node, index) => (
        <TreeNode key={index} node={node} level={0} />
      ))}
    </div>
  )
}

