import DOMPurify from 'dompurify'

interface SanitizedHtmlProps {
  html: string
  className?: string
}

const SanitizedHtml: React.FC<SanitizedHtmlProps> = ({ html, className }) => {
  const sanitized = DOMPurify.sanitize(html, {
    ADD_TAGS: ['br'],
    ADD_ATTR: [],
  })

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}

export { SanitizedHtml }
