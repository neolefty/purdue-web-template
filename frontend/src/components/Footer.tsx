interface FooterProps {
  logoSrc?: string
  logoAlt?: string
  year?: number
  copyrightText?: string
  tagline?: string
}

export default function Footer({
  logoSrc = '/purdue-logo-vertical.svg',
  logoAlt = 'Purdue University',
  year = new Date().getFullYear(),
  copyrightText = 'Purdue University. All rights reserved.',
  tagline = 'An equal access/equal opportunity university'
}: FooterProps) {
  return (
    <footer className="bg-purdue-black text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="mb-6 md:mb-0">
            <img
              src={logoSrc}
              alt={logoAlt}
              className="h-24 w-auto"
            />
          </div>

          <div className="text-left md:text-right">
            <p className="text-sm text-purdue-gray-300">
              © {year} {copyrightText}
            </p>
            <p className="text-xs text-purdue-gray-400 mt-1">
              {tagline}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
