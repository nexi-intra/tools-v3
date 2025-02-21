import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useEffect, useState } from "react"

export interface IProgressProps {
  progress: number
  done: boolean,
  title: string
  description: string
}


export function ProcessStatusOverlay(props: IProgressProps) {
  const [isOpen, setisOpen] = useState(true)


  if (props.done) {
    return null
  }
  return (
    <Dialog defaultOpen={isOpen} onOpenChange={setisOpen}  >

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
          <DialogDescription>
            {props.description}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Progress value={props.progress} />

          </div>

        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setisOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
