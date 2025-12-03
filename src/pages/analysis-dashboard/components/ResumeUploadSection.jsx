import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

const ResumeUploadSection = ({ onResumeChange, resumeText }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('text');
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e?.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e?.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setIsDragging(false);
    
    const files = e?.dataTransfer?.files;
    if (files?.length > 0) {
      handleFileUpload(files?.[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const fileName = file?.name?.toLowerCase() || '';

    try {
      let extractedText = '';

      // Handle DOCX files
      if (fileName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      }
      // Handle PDF files
      else if (fileName.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          pages.push(pageText);
        }

        extractedText = pages.join('\n');
      }
      // Handle TXT files
      else if (fileName.endsWith('.txt')) {
        const text = await file.text();
        extractedText = text;
      }
      // Unsupported file type
      else {
        alert('Only .txt, .pdf, and .docx files are supported');
        return;
      }

      // Validate extracted text
      if (!extractedText || extractedText.trim().length === 0) {
        alert('No text could be extracted from the file. Please check your file.');
        return;
      }

      // Success - pass extracted text to parent and store filename
      setUploadedFileName(file?.name);
      onResumeChange(extractedText);
    } catch (error) {
      console.error('File parsing error:', error);
      alert(`Error reading file: ${error.message}. Please try another file.`);
      setUploadedFileName(null);
    }
  };

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleTextChange = (e) => {
    onResumeChange(e?.target?.value);
  };

  const handleSwitchToText = () => {
    setUploadMethod('text');
    onResumeChange(''); // Clear the textarea
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Icon name="FileText" size={20} color="var(--color-primary)" />
          Resume Input
        </h2>
        <div className="flex gap-2">
          <Button
            variant={uploadMethod === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={handleSwitchToText}
          >
            Paste Text
          </Button>
          <Button
            variant={uploadMethod === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMethod('file')}
          >
            Upload File
          </Button>
        </div>
      </div>
      {uploadMethod === 'file' ? (
        <div>
          {uploadedFileName ? (
            <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <Icon name="CheckCircle2" size={20} color="var(--color-success)" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Resume uploaded successfully
                </p>
                <p className="text-xs text-muted-foreground">
                  {uploadedFileName}
                </p>
              </div>
              <button
                onClick={() => {
                  setUploadedFileName(null);
                  setUploadMethod('file');
                }}
                className="text-xs text-primary hover:underline"
              >
                Change
              </button>
            </div>
          ) : null}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`drop-zone ${isDragging ? 'active' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-medium mb-2">
              Drag and drop your resume here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse files
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef?.current?.click()}
            >
              Select File
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: PDF, DOC, DOCX, TXT (Max 5MB)
            </p>
          </div>
        </div>
      ) : (
        <div>
          <textarea
            value={resumeText}
            onChange={handleTextChange}
            placeholder={`Paste your resume text here...

Include:
• Contact information
• Professional summary
• Skills
• Work experience
• Education`}
            className="w-full h-96 px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none custom-scrollbar"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {resumeText?.length} characters
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumeUploadSection;