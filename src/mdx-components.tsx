import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'
import Link from 'next/link'
 
// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including components from other libraries.
 
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override the default components with custom ones if needed
    a: ({ href, children }) => (
      <Link href={href as string} className="text-accent hover:text-btnPrimaryHover underline">
        {children}
      </Link>
    ),
    
    // Image component with Next.js Image
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
        className="rounded-lg my-6"
        {...(props as ImageProps)}
        alt={props.alt || 'Image'}
      />
    ),
    
    // Include any custom components passed in
    ...components,
  }
}