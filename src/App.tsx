import ScoreEditor from './components/ScoreEditor'
import ScoreRender from './components/ScoreRender'
import { type Score } from './models/types'
import { readFile } from './utils/filesystem'
import { parseScore } from './utils/score'
import { useEffect, useState } from 'react'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [templateContent, setTemplateContent] = useState('')
  const [score, setScore] = useState<Score>({ title: '', composer: '', sections: [] })

  useEffect(() => {
    const loadTemplate = async () => {
      const templateContent = await readFile('scores/template.laras')
      setTemplateContent(templateContent)
      const templateScore = parseScore(templateContent)
      setScore(templateScore)
      setIsLoading(false)
    }
    loadTemplate()
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="font-mono text-lg">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen min-h-0">
      <div className="h-full w-full overflow-scroll">
        <ScoreEditor
          initialContent={templateContent}
          saveCallback={(content: string) => setScore(parseScore(content))}
        />
      </div>
      <div className="h-full w-full overflow-scroll">
        <ScoreRender score={score} />
      </div>
    </div>
  )
}
