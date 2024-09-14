"use client";

import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import imageCompression from 'browser-image-compression';

const OptiPic = () => {
  const [files, setFiles] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [addSuffix, setAddSuffix] = useState(true);
  const [suffix, setSuffix] = useState('-compressed');
  const [format, setFormat] = useState('jpeg');
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const handleButtonClick = () => {
    document.getElementById('file-upload').click();
  };

  const compressImage = async (file) => {
    const options = {
      maxSizeMB: 1, // compress to 1MB
      maxWidthOrHeight: Math.max(maxWidth, maxHeight),
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], file.name, { type: compressedFile.type });
    } catch (error) {
      console.error("Compression failed", error);
      return file; // Return original file if compression fails
    }
  };

  const handleCompression = async () => {
    setCompressing(true);
    setProgress(0);

    try {
      const compressedFiles = await Promise.all(files.map(compressImage));

      const formData = new FormData();
      compressedFiles.forEach((file) => formData.append('images', file));
      formData.append('quality', quality.toString());
      formData.append('maxWidth', maxWidth.toString());
      formData.append('maxHeight', maxHeight.toString());
      formData.append('addSuffix', addSuffix.toString());
      formData.append('suffix', suffix);
      formData.append('format', format);

      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Compression failed');
      }

      const data = await response.json();

      // Create download links for compressed images
      data.compressedImages.forEach((img) => {
        const blob = new Blob([new Uint8Array(img.buffer.data)], { type: `image/${format}` });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = img.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });

      setProgress(100);
    } catch (error) {
      console.error('Error during compression:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setCompressing(false);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center p-6 max-w-3xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-black rounded-full"></div>
          <span className="font-semibold text-xl">OptiPic</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-4 text-center">Compress your images easily</h1>
        <p className="text-xl text-gray-600 mb-12 text-center">
          The quickest and most effective online tool for compressing images. Easily optimize your images in no time, all while keeping it secure.
        </p>

        {/* File Upload Area */}
        <div
          className={`bg-white border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} p-12 rounded-lg mb-12 text-center transition-colors duration-300`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileChange}
            multiple
            accept="image/*"
          />
          <Button
            onClick={handleButtonClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold"
          >
            Browse files
            <Upload className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-sm text-gray-500">or drop files here</p>
        </div>

        {/* Display selected files */}
        {files.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Selected Files:</h3>
            <ul className="list-disc pl-5">
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Compression Settings */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold mb-6">Compression Settings</h2>

          <div>
            <Label htmlFor="quality-slider" className="font-semibold">Quality: {quality}%</Label>
            <Slider
              id="quality-slider"
              min={1}
              max={100}
              step={1}
              value={[quality]}
              onValueChange={(value) => setQuality(value[0])}
              className="mt-2"
            />
          </div>

          <div>
            <h3 className="font-semibold mb-4">Dimensions</h3>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="max-width">Max Width</Label>
                <Input
                  id="max-width"
                  type="number"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="max-height">Max Height</Label>
                <Input
                  id="max-height"
                  type="number"
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="add-suffix" className="font-semibold">Add file suffix</Label>
            <Switch
              id="add-suffix"
              checked={addSuffix}
              onCheckedChange={setAddSuffix}
            />
          </div>

          {addSuffix && (
            <div>
              <Label htmlFor="suffix">Suffix</Label>
              <Input
                id="suffix"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="format-select" className="font-semibold mb-2">Output Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpeg">JPEG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <Button
          onClick={handleCompression}
          className="w-full mt-8 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg"
        >
          Compress Images
        </Button>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-gray-200">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full"></div>
            <span className="font-semibold">OptiPic</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OptiPic;