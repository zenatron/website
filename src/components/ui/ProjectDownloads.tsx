"use client";

import { useState, useRef, useEffect } from "react";
import { FaDownload, FaChevronDown, FaFile, FaFileArchive } from "react-icons/fa";

interface Download {
  filename: string;
  label?: string;
  type?: string;
}

interface ProjectDownloadsProps {
  downloads: Download[];
  projectTitle: string;
}

export default function ProjectDownloads({ downloads, projectTitle }: ProjectDownloadsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set(downloads.map(d => d.filename)));
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle file selection
  const toggleFile = (filename: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedFiles(newSelected);
  };

  // Select/Deselect all
  const toggleAll = () => {
    if (selectedFiles.size === downloads.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(downloads.map(d => d.filename)));
    }
  };

  // Download selected files
  const downloadSelected = () => {
    if (selectedFiles.size === 0) return;

    // If only one file selected, download directly
    if (selectedFiles.size === 1) {
      const filename = Array.from(selectedFiles)[0];
      const link = document.createElement("a");
      link.href = `/downloads/${filename}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsOpen(false);
      return;
    }

    // For multiple files, download each one
    // Note: Real zip creation would require server-side processing
    // This downloads files individually for now
    selectedFiles.forEach((filename) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = `/downloads/${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 100);
    });
    setIsOpen(false);
  };

  // Single file - simple download button
  if (downloads.length === 1) {
    const download = downloads[0];
    return (
      <a
        href={`/downloads/${download.filename}`}
        download
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-2 md:px-4 py-1.5 
                   text-xs md:text-sm inline-flex items-center gap-2
                   hover:bg-white/10 hover:border-white/20 shadow-lg transition-all duration-300"
        title={download.label || "Download"}
      >
        <FaDownload />
        <span className="hidden sm:inline">{download.label || "Download"}</span>
        <span className="sm:hidden">Download</span>
      </a>
    );
  }

  // Multiple files - dropdown with selection
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-2 md:px-4 py-1.5 
                   text-xs md:text-sm inline-flex items-center gap-2
                   hover:bg-white/10 hover:border-white/20 shadow-lg transition-all duration-300"
        title="Download files"
      >
        <FaDownload />
        <span className="hidden sm:inline">
          Downloads ({selectedFiles.size}/{downloads.length})
        </span>
        <span className="sm:hidden">Files</span>
        <FaChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Select Files to Download</span>
              <button
                onClick={toggleAll}
                className="text-xs text-accent hover:text-accent/80 transition-colors"
              >
                {selectedFiles.size === downloads.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>

          {/* File list */}
          <div className="max-h-64 overflow-y-auto">
            {downloads.map((download) => {
              const isSelected = selectedFiles.has(download.filename);
              return (
                <label
                  key={download.filename}
                  className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleFile(download.filename)}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-accent focus:ring-2 focus:ring-accent focus:ring-offset-0"
                  />
                  <FaFile className="text-muted-text text-sm flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {download.label || download.filename}
                    </div>
                    {download.label && (
                      <div className="text-xs text-muted-text truncate">
                        {download.filename}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Footer with download button */}
          <div className="p-3 border-t border-white/10 bg-white/5">
            <button
              onClick={downloadSelected}
              disabled={selectedFiles.size === 0}
              className={`w-full bg-accent/90 hover:bg-accent text-white font-medium rounded-lg
                         text-sm py-2 inline-flex items-center justify-center gap-2
                         transition-all duration-300 shadow-lg
                         ${selectedFiles.size === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {selectedFiles.size === 1 ? (
                <>
                  <FaDownload /> Download File
                </>
              ) : (
                <>
                  <FaFileArchive /> Download {selectedFiles.size} Files
                </>
              )}
            </button>
            {selectedFiles.size > 1 && (
              <p className="text-xs text-muted-text mt-2 text-center">
                Files will download individually
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
