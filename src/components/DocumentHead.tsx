import React, { useEffect } from 'react';

interface DocumentHeadProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogType?: string;
  ogImage?: string;
}

export const DocumentHead: React.FC<DocumentHeadProps> = ({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage = '/favicon.svg'
}) => {
  useEffect(() => {
    // 1. Update document title
    document.title = title;

    // Helper for updating or creating tag elements safely
    const updateOrCreateMeta = (property: string, content: string, isPropertyField = true) => {
      const attributeName = isPropertyField ? 'property' : 'name';
      let element = document.head.querySelector(`meta[${attributeName}="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Update meta description and standard tags
    updateOrCreateMeta('description', description, false);
    updateOrCreateMeta('keywords', 'Deltaclause, Virtual Internship USA, Remote Tech Internship, Academic Program US recruitment, Verifiable Internship Certificate, Software Engineering Trainee, React Developer Placement US', false);
    updateOrCreateMeta('robots', 'index, follow', false);

    // 3. Update canonical URL
    let canonicalElement = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    const derivedUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://deltaclause.com/');
    canonicalElement.setAttribute('href', derivedUrl);

    // 4. Update Open Graph Meta tags for high-perf LinkedIn / Slack / Discord sharing
    updateOrCreateMeta('og:title', title);
    updateOrCreateMeta('og:description', description);
    updateOrCreateMeta('og:type', ogType);
    updateOrCreateMeta('og:url', derivedUrl);
    updateOrCreateMeta('og:site_name', 'DeltaClause');

    // Make image URLs absolute for external crawlers like Linkedin and Googlebot
    let absoluteImgUrl = ogImage;
    if (ogImage.startsWith('/') && typeof window !== 'undefined') {
      absoluteImgUrl = `${window.location.origin}${ogImage}`;
    }
    updateOrCreateMeta('og:image', absoluteImgUrl);

    // 5. Twitter Card Tags
    updateOrCreateMeta('twitter:card', 'summary_large_image', false);
    updateOrCreateMeta('twitter:title', title, false);
    updateOrCreateMeta('twitter:description', description, false);
    updateOrCreateMeta('twitter:image', absoluteImgUrl, false);

    // 6. Geographic recruitment meta targets for the USA market
    updateOrCreateMeta('geo.region', 'US', false);
    updateOrCreateMeta('geo.position', '37.09024;-95.712891', false);
    updateOrCreateMeta('ICBM', '37.09024, -95.712891', false);
    updateOrCreateMeta('DC.title', title, false);

  }, [title, description, canonicalUrl, ogType, ogImage]);

  return null;
};
