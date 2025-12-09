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

    // Validate file size (5MB max)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      alert('File is too large. Maximum file size is 5MB. Please use a smaller file.');
      return;
    }

    // Validate file type
    const supportedTypes = ['.pdf', '.docx', '.doc', '.txt'];
    const hasValidExtension = supportedTypes.some(type => fileName.endsWith(type));
    if (!hasValidExtension) {
      alert('Unsupported file format. Please upload a PDF, DOCX, DOC, or TXT file.');
      return;
    }

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
        // Use local worker file from public folder instead of CDN
        // This is more reliable and doesn't depend on external CDN availability
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
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
        alert('Unable to extract text from your file. The file may be empty, a scanned image without text, or in an unsupported format. Please try another file.');
        return;
      }

      // Success - pass extracted text to parent and store filename
      setUploadedFileName(file?.name);
      onResumeChange(extractedText);
    } catch (error) {
      console.error('File parsing error:', error);
      console.error('Error message:', error?.message);
      console.error('Error name:', error?.name);
      console.error('Error stack:', error?.stack);
      console.error('Full error object:', error);

      let userMessage = '';
      const errorMsg = error?.message?.toLowerCase() || '';
      const errorName = error?.name?.toLowerCase() || '';

      console.log('Debug info - errorMsg:', errorMsg);
      console.log('Debug info - errorName:', errorName);
      console.log('Debug info - fileName:', fileName);

      // PDF-specific errors
      if (fileName.endsWith('.pdf')) {
        if (errorMsg.includes('worker') || errorMsg.includes('module') || errorMsg.includes('dynamic')) {
          userMessage = 'PDF Reader Issue: Unable to load PDF reader. This is a temporary technical issue. Please:\n• Try refreshing the page (F5)\n• Wait a moment and try again\n• If the problem persists, try a different browser';
        } else if (errorMsg.includes('invalid pdf') || errorMsg.includes('corrupted') || errorMsg.includes('unexpected end') || errorName.includes('parseerror')) {
          userMessage = 'Invalid PDF File: This PDF file appears to be corrupted or not a valid PDF. Try:\n• Opening the file in Adobe Reader to verify it works\n• Re-saving the file and re-uploading\n• Converting to a different format (DOCX or TXT)';
        } else if (errorMsg.includes('encrypted') || errorMsg.includes('password')) {
          userMessage = 'Encrypted PDF: This PDF is password-protected or encrypted. Please:\n• Remove the password protection in Adobe Reader\n• Save an unencrypted copy\n• Upload the unencrypted version';
        } else if (errorMsg.includes('timeout')) {
          userMessage = 'PDF Processing Timeout: The PDF took too long to process. This usually means:\n• The file is very large (try a smaller PDF)\n• The PDF has many complex pages (try extracting key pages)\n• There is a temporary network issue (try again in a moment)';
        } else {
          userMessage = 'PDF Reading Error: Unable to process this PDF. Common fixes:\n• Try converting the PDF to a different format (DOCX)\n• Ensure the PDF is not a scanned image without text\n• Try re-saving the PDF in Adobe Reader\n• Use a simpler PDF file format (not a form or interactive PDF)';
        }
      }
      // DOCX-specific errors
      else if (fileName.endsWith('.docx')) {
        if (errorMsg.includes('zip') || errorMsg.includes('archive')) {
          userMessage = 'Corrupted DOCX File: The DOCX file appears to be corrupted. Try:\n• Opening in Microsoft Word to verify\n• Saving a fresh copy of the file\n• Using "Save As" to create a new copy\n• Converting to PDF or TXT format';
        } else if (errorMsg.includes('xml')) {
          userMessage = 'Invalid DOCX Format: The DOCX file has formatting issues. Try:\n• Opening in Microsoft Word and re-saving\n• Removing complex formatting (tables, images, special fonts)\n• Converting to plain text (TXT) or PDF format';
        } else {
          userMessage = 'DOCX Processing Error: Unable to read this DOCX file. Please:\n• Open the file in Microsoft Word to verify it works\n• Remove any complex formatting (embedded media, forms)\n• Save a simplified copy\n• Try uploading as a PDF or TXT file instead';
        }
      }
      // TXT-specific errors
      else if (fileName.endsWith('.txt')) {
        if (errorMsg.includes('encoding')) {
          userMessage = 'File Encoding Issue: The TXT file uses an unsupported character encoding. Please:\n• Open the file in Notepad\n• Use File > Save As and select UTF-8 encoding\n• Upload the re-saved file';
        } else {
          userMessage = 'TXT File Error: Unable to read this TXT file. Please verify the file is valid plain text and try again.';
        }
      }
      // Generic fallback
      else {
        userMessage = 'File Processing Error: Unable to process your file. Please:\n• Ensure the file is in PDF, DOCX, DOC, or TXT format\n• Check that the file is not corrupted\n• Try a different file\n• Contact support if the problem persists';
      }

      alert(userMessage);
      setUploadedFileName(null);
    }
  };

  const handleFileSelect = (e) => {
    e?.stopPropagation?.();
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
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="FileText" size={20} color="var(--color-primary)" />
          </div>
          Resume Input
        </h2>
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <Button
            variant={uploadMethod === 'text' ? 'default' : 'ghost'}
            size="sm"
            onClick={handleSwitchToText}
            className={uploadMethod === 'text' ? 'shadow-sm' : ''}
          >
            Paste Text
          </Button>
          <Button
            variant={uploadMethod === 'file' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setUploadMethod('file')}
            className={uploadMethod === 'file' ? 'shadow-sm' : ''}
          >
            Upload File
          </Button>
        </div>
      </div>
      {uploadMethod === 'file' ? (
        <div>
          {uploadedFileName ? (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
                <Icon name="CheckCircle2" size={22} color="var(--color-success)" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Resume uploaded successfully
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {uploadedFileName}
                </p>
              </div>
              <button
                onClick={() => {
                  setUploadedFileName(null);
                  setUploadMethod('file');
                }}
                className="text-sm text-primary hover:text-primary/80 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-all duration-200"
              >
                Change
              </button>
            </div>
          ) : null}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef?.current?.click()}
            className={`drop-zone ${isDragging ? 'active' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-5 border border-border">
              <Icon name="Upload" size={28} className="text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium mb-2 text-base">
              Drag and drop your resume here
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              or click to browse files
            </p>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef?.current?.click();
              }}
              className="mb-5"
            >
              Select File
            </Button>
            <p className="text-sm text-muted-foreground">
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
            className="input-dark w-full h-96 resize-none custom-scrollbar"
          />
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-muted-foreground">
              {resumeText?.length?.toLocaleString()} characters
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUploadSection;