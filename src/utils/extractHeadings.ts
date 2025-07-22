export interface Heading {
  id: string;
  text: string;
  level: number;
}

/**
 * Generates a URL-friendly slug from heading text
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Extracts headings from markdown content
 * @param content - Raw markdown content
 * @returns Array of heading objects with id, text, and level
 */
export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const usedIds = new Set<string>();
  
  // Regular expression to match markdown headings (# ## ### etc.)
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length; // Number of # characters
    const text = match[2].trim();
    
    // Generate unique ID
    let baseId = generateSlug(text);
    let id = baseId;
    let counter = 1;
    
    // Ensure ID is unique
    while (usedIds.has(id)) {
      id = `${baseId}-${counter}`;
      counter++;
    }
    
    usedIds.add(id);
    
    headings.push({
      id,
      text,
      level,
    });
  }
  
  return headings;
}

/**
 * Builds a hierarchical structure from flat headings array
 * @param headings - Flat array of headings
 * @returns Nested heading structure
 */
export interface NestedHeading extends Heading {
  children: NestedHeading[];
}

export function buildHeadingHierarchy(headings: Heading[]): NestedHeading[] {
  const result: NestedHeading[] = [];
  const stack: NestedHeading[] = [];
  
  for (const heading of headings) {
    const nestedHeading: NestedHeading = {
      ...heading,
      children: [],
    };
    
    // Find the correct parent level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }
    
    if (stack.length === 0) {
      // Top-level heading
      result.push(nestedHeading);
    } else {
      // Child heading
      stack[stack.length - 1].children.push(nestedHeading);
    }
    
    stack.push(nestedHeading);
  }
  
  return result;
}
