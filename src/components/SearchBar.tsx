import { useState, useRef, useEffect } from "react";
import { FaTimes, FaHashtag } from "react-icons/fa";
import { MdKeyboardTab } from "react-icons/md";
import { ProjectCard, BlogPost } from "@/types/types";

interface SearchBarProps<T extends ProjectCard | BlogPost> {
  items: T[];
  onFilteredItems: (filtered: T[]) => void;
  className?: string;
}

export default function SearchBar<T extends ProjectCard | BlogPost>({ 
  items,
  onFilteredItems,
  className = ""
}: SearchBarProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const tagSuggestionsRef = useRef<HTMLDivElement>(null);

  // Extract all available tags
  const availableTags = Array.from(
    new Set(
      items.flatMap(item => 
        (item.metadata.tags || []).map(tag => tag.toLowerCase().trim())
      )
    )
  ).sort();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA' &&
        e.key === '/'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Filter items based on search and tags
  useEffect(() => {
    const filtered = items.filter(item => {
      // Check selected tags
      if (selectedTags.length > 0) {
        const itemTags = item.metadata.tags?.map(tag => tag.toLowerCase().trim()) || [];
        const hasAllSelectedTags = selectedTags.every(selectedTag => 
          itemTags.includes(selectedTag)
        );
        if (!hasAllSelectedTags) return false;
      }

      // Check search query
      if (searchQuery) {
        const isProjectCard = (item: ProjectCard | BlogPost): item is ProjectCard => {
          return 'description' in item.metadata;
        };

        const itemContent = (
          item.metadata.title.toLowerCase() + ' ' +
          (isProjectCard(item) ? item.metadata.description?.toLowerCase() : item.metadata.excerpt?.toLowerCase() || '') +
          ('content' in item ? ' ' + item.content.toLowerCase() : '')
        );
        
        // Split search query into terms
        const terms = searchQuery.toLowerCase().split(' ');
        
        // Check if all terms match
        const matchesSearch = terms.every(term => {
          // Skip empty terms
          if (term === '') return true;
          
          // If term is a tag search (starts with #)
          if (term.startsWith('#')) {
            const tagQuery = term.slice(1).toLowerCase();
            // If just # with nothing after, match everything
            if (!tagQuery) return true;
            
            // For partial tag searches in the query (not selected tags),
            // we want to match any item that has a tag containing the query
            const itemTagsLower = item.metadata.tags?.map(tag => tag.toLowerCase().trim()) || [];
            return itemTagsLower.some(tag => tag.includes(tagQuery));
          }
          
          // For regular search terms, check if they appear in the content
          return itemContent.includes(term);
        });
        
        if (!matchesSearch) return false;
      }

      return true;
    });

    onFilteredItems(filtered);
  }, [searchQuery, selectedTags, items, onFilteredItems]);

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedSuggestionIndex >= 0 && tagSuggestionsRef.current) {
      const suggestions = tagSuggestionsRef.current.children;
      if (suggestions[selectedSuggestionIndex]) {
        suggestions[selectedSuggestionIndex].scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedSuggestionIndex]);

  // Get tag suggestions based on current input
  const getTagSuggestions = () => {
    const hashIndex = searchQuery.lastIndexOf('#');
    if (hashIndex === -1) return [];
    
    const tagQuery = searchQuery.slice(hashIndex + 1).toLowerCase().trim();
    if (!tagQuery) return availableTags;
    
    return availableTags.filter(tag => tag.includes(tagQuery));
  };

  // Handle tag suggestion click or selection
  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    
    const hashIndex = searchQuery.lastIndexOf('#');
    if (hashIndex !== -1) {
      setSearchQuery(searchQuery.slice(0, hashIndex).trimEnd());
    }
    
    setShowTagSuggestions(false);
    setSelectedSuggestionIndex(-1);
    searchInputRef.current?.focus();
  };

  // Remove a selected tag
  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    searchInputRef.current?.focus();
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setShowTagSuggestions(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-md border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center group">
        <div className="flex flex-1 items-center flex-wrap gap-1 py-1 px-2 w-full">
          {selectedTags.map((tag, index) => (
            <div 
              key={index}
              className="flex items-center gap-1 bg-accent/20 text-accent rounded-full px-2 py-0.5 text-sm"
            >
              <FaHashtag size={10} />
              <span>{tag}</span>
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-white transition-colors"
              >
                <FaTimes size={10} />
              </button>
            </div>
          ))}
          <input
            ref={searchInputRef}
            type="text"
            placeholder={selectedTags.length > 0 ? "" : "Search... (Use # for tags)"}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowTagSuggestions(e.target.value.includes('#'));
              setSelectedSuggestionIndex(-1);
            }}
            onKeyDown={(e) => {
              const suggestions = getTagSuggestions();
              
              if (e.key === 'Escape') {
                setShowTagSuggestions(false);
                setSelectedSuggestionIndex(-1);
                return;
              }

              // Handle backspace to remove the last tag when input is empty
              if (e.key === 'Backspace' && searchQuery === '' && selectedTags.length > 0) {
                e.preventDefault();
                const newTags = [...selectedTags];
                newTags.pop();
                setSelectedTags(newTags);
                return;
              }

              if (showTagSuggestions && suggestions.length > 0) {
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedSuggestionIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : prev
                  );
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedSuggestionIndex(prev => 
                    prev > 0 ? prev - 1 : -1
                  );
                } else if ((e.key === 'Tab' || e.key === 'Enter') && selectedSuggestionIndex >= 0) {
                  e.preventDefault();
                  handleTagSelect(suggestions[selectedSuggestionIndex]);
                } else if (e.key === 'Tab' && suggestions.length > 0) {
                  e.preventDefault();
                  handleTagSelect(suggestions[0]);
                }
              }
            }}
            className="flex-1 py-1 bg-transparent text-primary-text focus:outline-none transition-colors placeholder-muted-text min-w-[200px]"
          />
        </div>
        
        <div className="flex items-center">
          {(searchQuery || selectedTags.length > 0) && (
            <button
              onClick={clearSearch}
              className="px-3 text-muted-text hover:text-accent transition-colors"
            >
              <FaTimes size={14} />
            </button>
          )}
          <div className="px-3 text-muted-text border-l border-white/5 flex items-center justify-center">
            <kbd className="text-xs bg-white/5 px-1.5 py-0.5 rounded font-mono text-muted-text">/</kbd>
          </div>
        </div>
      </div>

      {showTagSuggestions && (
        <div
          ref={tagSuggestionsRef}
          className="absolute z-50 mt-2 w-full max-h-48 overflow-y-auto rounded-lg bg-white/5 backdrop-blur-xl border border-white/5 shadow-[0_0_15px_rgba(0,0,0,0.2)]"
        >
          {getTagSuggestions().map((tag, index) => (
            <button
              key={tag}
              onClick={() => handleTagSelect(tag)}
              className={`w-full text-left px-4 py-2.5 hover:bg-white/10 text-sm transition-colors flex items-center gap-2
                ${selectedSuggestionIndex === index ? 'bg-white/10' : ''}`}
            >
              <FaHashtag className="text-accent" />
              <span className="flex-1">{tag}</span>
              {selectedSuggestionIndex === index && (
                <div className="flex items-center gap-1 text-accent text-xs">
                  TAB
                  <MdKeyboardTab />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}