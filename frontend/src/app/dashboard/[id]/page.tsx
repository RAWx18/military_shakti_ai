'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Bell, Upload, X, Box, Layers } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/DashboardSidebar';
import { getCookie } from 'cookies-next';
import { MediaModal } from '@/components/imageModal';
import { UserMenu } from '@/components/userMenu';
interface UserData {
  name: string;
  email: string;
  position: string;
}
interface ChatMessage {
  sender: 'bot' | 'user';
  message: string | null;
  images: string[] | null;
  videos: string[] | null;
  pdfs  : string[] | null;
  timestamp: string;
}

const detectionData = [
  { month: 'Jan', value: 65 },
  { month: 'Feb', value: 80 },
  { month: 'Mar', value: 95 },
  { month: 'Apr', value: 75 },
  { month: 'May', value: 85 },
  { month: 'Jun', value: 90 },
];

const categoryData = [
  { name: 'Military Vehicles', value: 40 },
  { name: 'Personnel', value: 35 },
  { name: 'Buildings', value: 25 },
];

const COLORS = ['#3B82F6', '#6366F1', '#8B5CF6'];

export default function MilitaryVisionDashboard() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showDetection, setShowDetection] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const fileInputRef = useRef<HTMLInputElement>(null); 
   const params = useParams();
  const chatId = params.id as string;
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sidebarTriggerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [uploadedPdfs, setUploadedPdfs] = useState<string[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video' | 'pdf' | null>(null);

  
  
  

  useEffect(() => {
    fetchChatHistory();
  }, [chatId]);
  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      return;
    }
    async function fetchData() {
    const data = await fetch('http://localhost:8000/api/user', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
    });
    const fetchedData = await data.json();
    setUserData(fetchedData);
  }
  fetchData();
}, []);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const fetchChatHistory = async () => {
    const token = getCookie('token');
    if (!token) {
      toast({
        title: 'Authentication Error',
        description: 'Please log in to view chat history.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:8000/api/chat/${chatId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast({
          title: 'Error',
          description: 'Failed to load chat history. Please try again.',
          variant: 'destructive',
        });
        throw new Error('Failed to fetch chat history');
      }

      const data = await response.json();
      setChatHistory(data.chats);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load chat history. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages: string[] = [];
      const newVideos: string[] = [];
      const newPdfs: string[] = [];
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          if (file.size > 5 * 1024 * 1024) {
            toast({
              title: 'File too large',
              description: 'Please upload images smaller than 5MB each.',
              variant: 'destructive',
            });
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            newImages.push(e.target?.result as string);
            if (newImages.length + uploadedImages.length <= 5) {
              setUploadedImages((prev) => [...prev, ...newImages]);
            } else {
              toast({
                title: 'Too many images',
                description: 'You can upload a maximum of 5 images.',
                variant: 'destructive',
              });
            }
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
          if (file.size > 100 * 1024 * 1024) {
            toast({
              title: 'File too large',
              description: 'Please upload videos smaller than 100MB each.',
              variant: 'destructive',
            });
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            newVideos.push(e.target?.result as string);
            if (newVideos.length + uploadedVideos.length <= 2) {
              setUploadedVideos((prev) => [...prev, ...newVideos]);
            } else {
              toast({
                title: 'Too many videos',
                description: 'You can upload a maximum of 2 videos.',
                variant: 'destructive',
              });
            }
          };
          reader.readAsDataURL(file);
        } 
        else if (file.type === 'application/pdf') {
          if (file.size > 10 * 1024 * 1024) {
            toast({
              title: 'File too large',
              description: 'Please upload PDFs smaller than 10MB each.',
              variant: 'destructive',
            });
            return;
          }
          const reader = new FileReader();
          reader.onload = (e) => {
            newPdfs.push(e.target?.result as string);
            if (uploadedPdfs.length <= 1) {
              setUploadedPdfs((prev) => [...prev, ...newPdfs]);
            } else {
              toast({
                title: 'Too many PDFs',
                description: 'You can upload a maximum of 2 PDFs.',
                variant: 'destructive',
              });
            }
          };
          reader.readAsDataURL(file);
        }
        else {
          toast({
            title: 'Invalid file type',
            description: 'Please upload only image or video files.',
            variant: 'destructive',
          });
        }
      });
    }
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prevImages) => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      if (updatedImages.length === 0) {
        setFileInputKey(Date.now());
      }
      return updatedImages;
    });
  };

  const removeUploadedVideo = (index: number) => {
    setUploadedVideos((prevVideos) => {
      const updatedVideos = prevVideos.filter((_, i) => i !== index);
      if (updatedVideos.length === 0) {
        setFileInputKey(Date.now()); 
      }
      return updatedVideos;
    });
  };
  const removeUploadedPdf = (index: number) => {
    setUploadedPdfs((prevPdfs) => prevPdfs.filter((_, i) => i !== index));
    if(uploadedPdfs.length === 0) {
      setFileInputKey(Date.now());
    }
  }
  const handleSendMessage = async () => {
    if (message.trim() || uploadedImages.length > 0 || uploadedVideos.length > 0 || uploadedPdfs.length>0) {
      const token = getCookie('token');
      if (!token) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in to send messages.',
          variant: 'destructive',
        });
        return;
      }
      try {
        setIsLoading(true);

        const imageData = uploadedImages.map((img) => img.split(',')[1]);
        const videoData = uploadedVideos.map((vid) => vid.split(',')[1]);
        const pdfData = uploadedPdfs.map((pdf) => pdf.split(',')[1]);
        const payload = {
          message: message.trim() || null,
          images: imageData,
          videos: videoData,
          pdfs: pdfData,
        };

        const response = await fetch(
          `http://localhost:8000/api/chat/${chatId}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          toast({
            title: 'Error',
            description: 'Failed to send message. Please try again.',
            variant: 'destructive',
          });
          throw new Error('Failed to send message');
        }

        const newMessages = await response.json();
        setChatHistory((prevHistory) => [...prevHistory, ...newMessages]);
        setMessage('');
        setUploadedImages([]);
        setUploadedVideos([]);
        setUploadedPdfs([]);
        setFileInputKey(Date.now()); // Reset the file input key
      // FileRef also to null
      } catch (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };


  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleMouseEnter = () => setShowSidebar(true);
  const handleMouseLeave = (event: React.MouseEvent) => {
    if (
      !event.relatedTarget ||
      !(event.relatedTarget as HTMLElement).closest('.sidebar')
    ) {
      setShowSidebar(false);
    }
  };

  const openMediaViewer = (mediaUrl: string, mediaType: 'image' | 'video') => {
    setSelectedMedia(mediaUrl);
    setSelectedMediaType(mediaType);
  };

  const closeMediaViewer = () => {
    setSelectedMedia(null);
    setSelectedMediaType(null);
  };


  const renderImageGrid = (images: string[], videos: string[], pdfs: string[] = []) => {
    const mediaCount = images.length + videos.length;
    let gridClass = '';
    let mediaSize = '';
  
    switch (mediaCount) {
      case 1:
        gridClass = 'grid-cols-1';
        mediaSize = 'aspect-square sm:aspect-video';
        break;
      case 2:
        gridClass = 'grid-cols-2';
        mediaSize = 'aspect-square';
        break;
      case 3:
        gridClass = 'grid-cols-3';
        mediaSize = 'aspect-square';
        break;
      case 4:
        gridClass = 'grid-cols-2 grid-rows-2';
        mediaSize = 'aspect-square';
        break;
      default:
        gridClass = 'grid-cols-3';
        mediaSize = 'aspect-square';
    }
  
    return (
      <div className={`grid ${gridClass} gap-2 mt-2`}>
        {images.map((image, imgIndex) => (
          <div
            key={imgIndex}
            className={`relative cursor-pointer ${mediaSize}`}
            onClick={() => openMediaViewer(`http://localhost:8000/images/${image}`, 'image')}
          >
            <Image
              src={`http://localhost:8000/images/${image}`}
              alt={`Uploaded image ${imgIndex + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
        ))}
        {videos.map((video, vidIndex) => (
          <div
            key={vidIndex}
            className={`relative cursor-pointer ${mediaSize}`}
            onClick={() => openMediaViewer(`http://localhost:8000/videos/${video}`, 'video')}
          >
            <video
              src={`http://localhost:8000/videos/${video}`}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        ))}
        {pdfs.map((pdf, pdfIndex) => (
          <div
            key={pdfIndex}
            className={`relative cursor-pointer ${mediaSize}`}
            onClick={() => openMediaViewer(`http://localhost:8000/pdfs/${pdf}`, 'pdf')}
          >
            <Box className="w-full h-full object-cover rounded-md" />
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSendMessage]);


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 overflow-hidden">
      <motion.div
        className="flex min-h-screen bg-background dark:bg-zinc-900"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <div
          className="flex min-h-screen bg-background dark:bg-zinc-900"
          onMouseLeave={handleMouseLeave}
        >
          <Sidebar isVisible={showSidebar} />
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-800 ">
      <header className="flex items-center justify-between mt-2 pb-2 pl-4 pr-4 border-b dark:border-zinc-700">
      <div className="flex items-center">
        {/* Logo Section with Animation */}
        <div
          ref={sidebarTriggerRef}
          className="relative z-50"
          onMouseEnter={handleMouseEnter}
        >
          <motion.h1
            className={`text-2xl font-bold cursor-pointer transition-colors duration-200 ${
              showSidebar ? "text-white" : "dark:text-white"
            }`}
            whileHover={{ scale: 1.1, color: "#a78bfa" }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/">SHAKTI AI</Link>
          </motion.h1>
        </div>

        {/* Status Indicator without animation */}
        <div className="mt-1 ml-10 text-sm text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-300 px-3 py-1 rounded-full inline-block">
          All Detection Models Active
        </div>
      </div>

      {/* User Menu Section with Hover Effect */}
      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{
            scale: 1.1,
            rotate: 10,
            transition: { duration: 0.3 }
          }}
          className="cursor-pointer"
        >
          <UserMenu
            name={userData?.name || "Guest"}
            email={userData?.email || "Not logged in"}
            position={userData?.position || "N/A"}
          />
        </motion.div>
      </div>
    </header>
        <AnimatePresence>
          <div className="flex flex-1 gap-4 p-4 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-1 overflow-hidden"
            >
             
             <Card className="h-full rounded-lg shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
      <CardContent className="p-4 h-full flex flex-col">
        <div
          ref={chatContainerRef} // Reference to the container
          className="bg-gray-50 dark:bg-zinc-800 p-4 pb-0 mb-0 rounded-lg overflow-y-auto flex-grow h-[calc(100vh-350px)] scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-200 dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-zinc-800"
        >
          <div className="flex flex-col items-center">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} w-full mb-4`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className={`rounded-lg p-4 break-words transition-all duration-300 ease-in-out ${
                    message.sender === 'user'
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200'
                  }`}
                  style={{
                    width: message.sender === 'user' && (message.images?.length || message.videos?.length)
                      ? '65%'
                      : '30%',
                    maxWidth: message.sender === 'user' && (message.images?.length || message.videos?.length)
                      ? '600px'
                      : '300px',
                    marginLeft: message.sender === 'user' ? 'auto' : '15%',
                    marginRight: message.sender === 'user' ? '15%' : 'auto',
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(0, 0, 255, 0.3)',
                  }}
                >
                  {(message.images?.length || message.videos?.length || message.pdfs?.length) ? renderImageGrid(message.images, message.videos, message.pdfs) : null}
                  {message.message && <p className="text-sm mt-2">{message.message}</p>}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(message.timestamp).toLocaleString()}
                  </p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

    {/* Uploaded Images/Videos Section */}
    {(uploadedImages.length > 0 || uploadedVideos.length > 0 || uploadedPdfs.length > 0) && (
      <div className="flex gap-2 pt-2 ml-40 mb-4">
        {uploadedImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative w-20 h-20 border rounded-md overflow-hidden cursor-pointer shadow-md hover:scale-105"
            onClick={() => openMediaViewer(image, 'image')}
          >
            <Image
              src={image}
              alt={`Uploaded image ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 w-6 h-6 p-1 bg-white rounded-full flex items-center justify-center hover:bg-red-500"
              onClick={(e) => {
                e.stopPropagation();
                removeUploadedImage(index);
              }}
            >
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </motion.div>
        ))}
        {uploadedVideos.map((video, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative w-20 h-20 border rounded-md overflow-hidden cursor-pointer shadow-md hover:scale-105"
            onClick={() => openMediaViewer(video, 'video')}
          >
            <video
              src={video}
              className="w-full h-full object-cover rounded-md"
              controls
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 w-6 h-6 p-1 bg-white rounded-full flex items-center justify-center hover:bg-red-500"
              onClick={(e) => {
                e.stopPropagation();
                removeUploadedVideo(index);
              }}
            >
              <X className="h-3 w-3 text-red-600" />
            </Button>
          </motion.div>
        ))}
        {uploadedPdfs.map((pdf, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="relative w-24 h-24 border rounded-md overflow-hidden cursor-pointer"
                            onClick={() => openMediaViewer(pdf, 'pdf')}
                          >
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <span className="text-sm text-gray-700">PDF {index + 1}</span>
                            </div>
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 w-6 h-6 p-1 bg-white rounded-full flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeUploadedPdf(index);
                              }}
                            >
                              <X className="h-3 w-3 text-red-600" />
                            </Button>
                          </motion.div>
                        ))}
      </div>
    )}

    {/* Message Input Area */}
    <div
      className={`flex gap-4 items-center ${
        uploadedImages.length > 0 || uploadedVideos.length > 0 ? 'mt-auto' : 'mt-4'
      } w-4/5 mx-auto px-4 py-3 border-t dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 rounded-lg`}
    >
      {/* Upload Button */}
      <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
        <Button
          variant="outline"
          size="icon"
          className="dark:border-zinc-700 dark:text-white"
          onClick={triggerFileInput}
          disabled={uploadedImages.length >= 5}
        >
          <Upload className="h-5 w-5" />
          <span className="sr-only">Upload Images</span>
        </Button>
      </motion.div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        key={fileInputKey}
        type="file"
        accept="image/*, video/*, application/pdf"
        onChange={handleFileUpload}
        className="hidden"
        multiple
      />

      {/* Message Input Field */}
      <motion.input
        whileFocus={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 px-4 py-3 rounded-md border-2 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type your message..."
      />

      {/* Send Button */}
      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.3 }}>
        <Button
          variant="primary"
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          onClick={handleSendMessage}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="animate-spin">⌛</span>
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
          <span className="sr-only">Send Message</span>
        </Button>
      </motion.div>
    </div>
  </CardContent>
</Card>

            </motion.div>

            <div className="flex items-start overflow-hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDetection(!showDetection)}
                className="dark:text-white dark:border-zinc-700 transition-transform duration-300 ease-in-out"
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform duration-300 ${
                    showDetection ? '' : 'rotate-180'
                  }`}
                />
                <span className="sr-only">
                  {showDetection
                    ? 'Hide Detection Results'
                    : 'Show Detection Results'}
                </span>
              </Button>
            </div>

            {showDetection && (
              <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-80 max-h-9/10 overflow-hidden"
            >
              <Card className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm h-full flex flex-col">
                <CardHeader className="flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-800 z-10 pb-4">
                  <CardTitle className="text-lg font-semibold dark:text-white">
                    Detection Results
                  </CardTitle>
                  <Button
                    variant="link"
                    className="text-blue-600 dark:text-blue-400 text-sm p-0"
                    onClick={() => setShowAnalytics(true)}
                  >
                    Full Analytics →
                  </Button>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-4 dark:text-white">
                        Detected Objects
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm dark:text-gray-300">
                              Military Vehicle
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              x2
                            </span>
                          </div>
                          

                          <Progress
                          
                            value={98}
                            className="h-1 bg-blue-100 dark:bg-blue-900"
                            indicatorClassName="bg-blue-600 dark:bg-blue-400"
                          />
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            98% confidence
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm dark:text-gray-300">
                              Personnel
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              x4
                            </span>
                          </div>
                          <Progress
                            value={95}
                            className="h-1 bg-blue-100 dark:bg-blue-900"
                            indicatorClassName="bg-blue-600 dark:bg-blue-400"
                          />
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            95% confidence
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm dark:text-gray-300">
                              Building
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              x1
                            </span>
                          </div>
                          <Progress
                            value={92}
                            className="h-1 bg-blue-100 dark:bg-blue-900"
                            indicatorClassName="bg-blue-600 dark:bg-blue-400"
                          />
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            92% confidence
                          </div>
                        </div>
                      </div>
                    </div>
        
                    <div>
                      <h3 className="font-medium mb-4 dark:text-white">
                        Detection Timeline
                      </h3>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={detectionData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#374151"
                            />
                            <XAxis
                              dataKey="month"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: '#9CA3AF' }}
                            />
                            <YAxis
                              domain={[0, 100]}
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: '#9CA3AF' }}
                              ticks={[0, 25, 50, 75, 100]}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'var(--background)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              dot={{ r: 4, fill: '#3B82F6' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
        
                    <div>
                      <h3 className="font-medium mb-4 dark:text-white">
                        Environmental Analysis
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Visibility
                          </div>
                          <div className="font-medium dark:text-white">
                            Good
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Weather
                          </div>
                          <div className="font-medium dark:text-white">
                            Clear
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Time
                          </div>
                          <div className="font-medium dark:text-white">
                            Day
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Terrain
                          </div>
                          <div className="font-medium dark:text-white">
                            Urban
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            )}
          </div>
        </AnimatePresence>

        <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold">
                  Advanced Analytics Dashboard
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAnalytics(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </DialogHeader>

            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detection Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={detectionData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)' }}
                          />
                          <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'var(--muted-foreground)' }}
                            ticks={[0, 25, 50, 75, 100]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="var(--primary)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: 'var(--primary)' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Object Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Historical Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={detectionData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis
                          dataKey="month"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--muted-foreground)' }}
                        />
                        <YAxis
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--muted-foreground)' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--background)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="var(--primary)"
                          strokeWidth={2}
                          dot={{ r: 4, fill: 'var(--primary)' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DialogContent>
        </Dialog>
        {selectedMedia && selectedMediaType && (
          <MediaModal
            isOpen={!!selectedMedia}
            onClose={closeMediaViewer}
            mediaSrc={selectedMedia}
            mediaType={selectedMediaType}
          />
        )}
        
      </div>
    </div>
  );
}

