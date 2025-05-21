import { parser } from '../grammar/laras'
import { syntaxHighlighting, HighlightStyle, LanguageSupport, LRLanguage } from '@codemirror/language'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { styleTags, Tag } from '@lezer/highlight'
import { basicSetup } from 'codemirror'
import { useRef, useEffect, type JSX } from 'react'

export default function ScoreEditor({
  initialContent = '',
  saveCallback,
}: {
  initialContent?: string
  saveCallback?: (content: string) => void
}): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const tags = {
      Name: Tag.define('Name'),
      Number: Tag.define('Number'),
      String: Tag.define('String'),
      Code: Tag.define('Code'),
    }

    const language = LRLanguage.define({
      parser: parser.configure({
        props: [
          styleTags({
            Name: tags.Name,
            Number: tags.Number,
            String: tags.String,
            Code: tags.Code,
          }),
        ],
      }),
    })

    const languageSupport = new LanguageSupport(language)

    const highlightStyle = HighlightStyle.define([
      { tag: tags.Name, class: 'text-blue-600 font-bold' },
      { tag: tags.Number, class: 'text-orange-600' },
      { tag: tags.String, class: 'text-green-600' },
      { tag: tags.Code, class: 'text-purple-600' },
    ])

    const refreshKeymap = keymap.of([
      {
        key: 'Mod-s',
        run: () => {
          if (saveCallback && viewRef.current) saveCallback(viewRef.current.state.doc.toString())
          return true
        },
        preventDefault: true,
      },
    ])

    const state = EditorState.create({
      doc: initialContent,
      extensions: [basicSetup, languageSupport, syntaxHighlighting(highlightStyle), refreshKeymap],
    })

    const view = new EditorView({ state, parent: containerRef.current })
    viewRef.current = view

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
      }
    }
  }, [])

  return <div ref={containerRef} className="h-full" />
}
