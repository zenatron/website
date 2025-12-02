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
        className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-sm text-secondary-text transition-colors hover:border-accent/30 hover:bg-white/[0.04] hover:text-accent"
        title={download.label || "Download"}
      >
        <FaDownload className="h-3.5 w-3.5" />
        <span>{download.label || "Download"}</span>
      </a>
    );
  }

  // Multiple files - dropdown with selection
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-sm text-secondary-text transition-colors hover:border-accent/30 hover:bg-white/[0.04] hover:text-accent"
        title="Download files"
      >
        <FaDownload className="h-3.5 w-3.5" />
        <span>
          Downloads ({selectedFiles.size}/{downloads.length})
        </span>
        <FaChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f1012] shadow-xl z-50">
          {/* Header */}
          <div className="border-b border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-text">Select Files</span>
              <button
                onClick={toggleAll}
                className="text-xs text-accent transition-colors hover:text-accent/80"
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
                  className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-white/[0.02]"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleFile(download.filename)}
                    className="h-4 w-4 rounded border-white/10 bg-white/[0.02] text-accent accent-accent focus:ring-1 focus:ring-accent focus:ring-offset-0"
                  />
                  <FaFile className="h-3.5 w-3.5 shrink-0 text-muted-text" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-primary-text">
                      {download.label || download.filename}
                    </div>
                    {download.label && (
                      <div className="truncate text-xs text-muted-text">
                        {download.filename}
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Footer with download button */}
          <div className="border-t border-white/[0.06] bg-white/[0.02] p-3">
            <button
              onClick={downloadSelected}
              disabled={selectedFiles.size === 0}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90 ${selectedFiles.size === 0 ? "cursor-not-allowed opacity-50" : ""}`}
            >
              {selectedFiles.size === 1 ? (
                <>
                  <FaDownload className="h-3.5 w-3.5" /> Download File
                </>
              ) : (
                <>
                  <FaFileArchive className="h-3.5 w-3.5" /> Download {selectedFiles.size} Files
                </>
              )}
            </button>
            {selectedFiles.size > 1 && (
              <p className="mt-2 text-center text-xs text-muted-text">
                Files will download individually
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
