"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Image,
  FileText,
  Undo,
  Redo
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }

  debounced.cancel = () => {
    clearTimeout(timeout)
  }

  return debounced
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const undoStackRef = useRef<string[]>([])
  const redoStackRef = useRef<string[]>([])
  const isUndoRedoRef = useRef(false)
  const lastSelectionRef = useRef<{ start: number; end: number } | null>(null)
  const isInitializedRef = useRef(false)
  const lastValueRef = useRef(value)

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitializedRef.current) {
      if (value) {
        editorRef.current.innerHTML = value
      } else {
        editorRef.current.innerHTML = ""
      }
      undoStackRef.current = [editorRef.current.innerHTML]
      isInitializedRef.current = true
      lastValueRef.current = editorRef.current.innerHTML
    }
  }, [value])

  // Handle external value changes
  useEffect(() => {
    if (editorRef.current && isInitializedRef.current && !isUndoRedoRef.current) {
      const currentContent = editorRef.current.innerHTML
      if (currentContent !== value && lastValueRef.current !== value) {
        editorRef.current.innerHTML = value
        lastValueRef.current = value
        // Update undo stack with external change
        undoStackRef.current.push(value)
        if (undoStackRef.current.length > 50) {
          undoStackRef.current.shift()
        }
      }
    }
  }, [value])

  const saveCursorPosition = useCallback(() => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || !editorRef.current.contains(selection.anchorNode)) return

    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(editorRef.current)
    preCaretRange.setEnd(range.endContainer, range.endOffset)

    const start = preCaretRange.toString().length
    lastSelectionRef.current = { start, end: start }
  }, [])

  const restoreCursorPosition = useCallback(() => {
    if (!editorRef.current || !lastSelectionRef.current) return

    const { start } = lastSelectionRef.current
    const selection = window.getSelection()
    if (!selection) return

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    )

    let charCount = 0
    let node: Text | null = null
    let offset = 0

    while (walker.nextNode()) {
      const textNode = walker.currentNode as Text
      const textLength = textNode.textContent?.length || 0
      
      if (charCount + textLength >= start) {
        node = textNode
        offset = start - charCount
        break
      }
      charCount += textLength
    }

    if (node) {
      const range = document.createRange()
      range.setStart(node, offset)
      range.setEnd(node, offset)
      selection.removeAllRanges()
      selection.addRange(range)
    } else {
      // Place cursor at the end
      const range = document.createRange()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }, [])

  const saveToUndoStack = useCallback((content: string) => {
    if (!isUndoRedoRef.current) {
      undoStackRef.current.push(content)
      redoStackRef.current = []
      if (undoStackRef.current.length > 50) {
        undoStackRef.current.shift()
      }
    }
  }, [])

  const execCommand = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      saveCursorPosition()
      
      const currentContent = editorRef.current.innerHTML
      saveToUndoStack(currentContent)

      editorRef.current.focus()
      
      try {
        let success = false
        
        if (command === 'insertHTML' && value) {
          // Handle custom HTML insertion
          const selection = window.getSelection()
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0)
            range.deleteContents()
            
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = value
            const fragment = document.createDocumentFragment()
            
            while (tempDiv.firstChild) {
              fragment.appendChild(tempDiv.firstChild)
            }
            
            range.insertNode(fragment)
            selection.removeAllRanges()
            selection.addRange(range)
            success = true
          }
        } else {
          success = document.execCommand(command, false, value)
        }

        if (!success) {
          console.warn(`Command ${command} failed`)
        }

        // Update content
        const newContent = editorRef.current.innerHTML
        onChange(newContent)
        lastValueRef.current = newContent

        // Restore cursor
        setTimeout(restoreCursorPosition, 10)
      } catch (error) {
        console.error('Error executing command:', error)
      }
    }
  }, [onChange, saveToUndoStack, saveCursorPosition, restoreCursorPosition])

  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length > 1) {
      const currentContent = undoStackRef.current.pop()!
      redoStackRef.current.push(currentContent)

      const previousContent = undoStackRef.current[undoStackRef.current.length - 1]
      if (editorRef.current) {
        isUndoRedoRef.current = true
        editorRef.current.innerHTML = previousContent
        onChange(previousContent)
        lastValueRef.current = previousContent
        isUndoRedoRef.current = false

        setTimeout(restoreCursorPosition, 10)
      }
    }
  }, [onChange, restoreCursorPosition])

  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length > 0) {
      const nextContent = redoStackRef.current.pop()!
      undoStackRef.current.push(nextContent)

      if (editorRef.current) {
        isUndoRedoRef.current = true
        editorRef.current.innerHTML = nextContent
        onChange(nextContent)
        lastValueRef.current = nextContent
        isUndoRedoRef.current = false

        setTimeout(restoreCursorPosition, 10)
      }
    }
  }, [onChange, restoreCursorPosition])

  const handleInput = useCallback(() => {
    if (editorRef.current && !isUndoRedoRef.current) {
      const currentContent = editorRef.current.innerHTML
      saveToUndoStack(currentContent)
      saveCursorPosition()
      debouncedOnChange(currentContent)
      lastValueRef.current = currentContent
    }
  }, [saveToUndoStack, saveCursorPosition])

  // Create debounced onChange
  const debouncedOnChange = useCallback(
    debounce((content: string) => {
      onChange(content)
    }, 300),
    [onChange]
  )

  const handleBlur = useCallback(() => {
    if (editorRef.current) {
      const currentContent = editorRef.current.innerHTML
      debouncedOnChange.cancel?.()
      onChange(currentContent)
      lastValueRef.current = currentContent
    }
  }, [onChange, debouncedOnChange])

  const insertLink = useCallback(() => {
    if (linkUrl) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText || linkUrl}</a>`
      execCommand('insertHTML', linkHtml)
      setIsLinkDialogOpen(false)
      setLinkUrl("")
      setLinkText("")
    }
  }, [linkUrl, linkText, execCommand])

  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:')
    if (url) {
      const imgHtml = `<img src="${url}" alt="" style="max-width: 100%; height: auto;" />`
      execCommand('insertHTML', imgHtml)
    }
  }, [execCommand])

  const formatBlock = useCallback((tagName: string) => {
    execCommand('formatBlock', tagName)
  }, [execCommand])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    
    // Get plain text from clipboard
    const text = e.clipboardData.getData('text/plain')
    
    if (editorRef.current) {
      // Insert plain text at cursor position
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        
        const textNode = document.createTextNode(text)
        range.insertNode(textNode)
        
        // Move cursor after the inserted text
        range.setStartAfter(textNode)
        range.setEndAfter(textNode)
        selection.removeAllRanges()
        selection.addRange(range)
        
        // Trigger input event
        const event = new Event('input', { bubbles: true })
        editorRef.current.dispatchEvent(event)
      }
    }
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle undo/redo with Ctrl+Z/Ctrl+Y
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault()
        handleRedo()
      }
    }
  }, [handleUndo, handleRedo])

  return (
    <div className={`border rounded-md relative ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={undoStackRef.current.length <= 1}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={redoStackRef.current.length === 0}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatBlock('h1')}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatBlock('h2')}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatBlock('h3')}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsLinkDialogOpen(true)}
          title="Insert Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertImage}
          title="Insert Image"
        >
          <Image className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none prose prose-sm max-w-none rich-text-editor"
        onInput={handleInput}
        onBlur={handleBlur}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        style={{
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6',
        }}
        suppressContentEditableWarning
      />

      {/* Link Dialog */}
      {isLinkDialogOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-background border rounded-md shadow-lg z-50 min-w-[300px]">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Link Text</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                placeholder="Enter link text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') insertLink()
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">URL</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') insertLink()
                }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsLinkDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={insertLink}
                disabled={!linkUrl}
              >
                Insert Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
