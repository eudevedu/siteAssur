import React, { useEffect } from 'react'
import { useSettings } from '../../context/SettingsContext'

export default function SEO({ title, description, image, article }) {
  const { settings } = useSettings()

  const siteName = settings?.general?.name || 'Site Político'
  const defaultDescription = settings?.general?.description || ''
  const seoTitle = title ? `${title} | ${siteName}` : `${siteName} - ${settings?.general?.slogan || ''}`
  const seoDescription = description || defaultDescription

  useEffect(() => {
    // Update Title
    document.title = seoTitle

    // Update Meta Tags
    const updateMetaTag = (name, property, content) => {
      if (!content) return
      
      let element = name 
        ? document.querySelector(`meta[name="${name}"]`)
        : document.querySelector(`meta[property="${property}"]`)

      if (!element) {
        element = document.createElement('meta')
        if (name) element.setAttribute('name', name)
        if (property) element.setAttribute('property', property)
        document.head.appendChild(element)
      }
      
      element.setAttribute('content', content)
    }

    updateMetaTag('description', null, seoDescription)
    updateMetaTag(null, 'og:title', seoTitle)
    updateMetaTag(null, 'og:description', seoDescription)
    updateMetaTag(null, 'og:type', article ? 'article' : 'website')
    if (image) updateMetaTag(null, 'og:image', image)

    // Twitter Tags
    updateMetaTag('twitter:card', null, 'summary_large_image')
    updateMetaTag('twitter:title', null, seoTitle)
    updateMetaTag('twitter:description', null, seoDescription)
    if (image) updateMetaTag('twitter:image', null, image)

  }, [seoTitle, seoDescription, image, article])

  return null // This component doesn't render anything
}
