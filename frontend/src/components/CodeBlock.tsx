interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export default function CodeBlock({ 
  code, 
  language = 'bash',
  className = '' 
}: CodeBlockProps) {
  return (
    <pre className={`bg-purdue-black text-white p-4 rounded-md overflow-x-auto font-mono ${className}`.trim()}>
      <code className={`language-${language}`}>
        {code}
      </code>
    </pre>
  )
}