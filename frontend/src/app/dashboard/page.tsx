"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, ImagePlus, X, Video as VideoIcon } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sidebar } from '@/components/DashboardSidebar';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { UserMenu } from '@/components/userMenu';
import { MediaModal } from '@/components/imageModal';

interface UserData {
  name: string;
  email: string;
  position: string;
}

export default function MilitaryVisionDashboard() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<string[]>([]);
  const [uploadedPdfs, setUploadedPdfs] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video' |'pdf' | null>(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Add a key for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const { toast } = useToast();
  const router = useRouter();

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

  const handleNewChat = async () => {
    if (!message.trim() && uploadedImages.length === 0 && uploadedVideos.length === 0 && uploadedPdfs.length === 0) {
      toast({
        title: "Input required",
        description: "Please enter a message or upload images/videos to start a new analysis.",
        variant: "destructive",
      });
      return;
    }

    const token = getCookie('token');
    if (!token) {
      console.log("NO TOKEN");
      toast({
        title: "Authentication Error",
        description: "Please log in to start a new analysis.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      message: message.trim() || null,
      images: uploadedImages.map((img) => img.split(',')[1]),
      videos: uploadedVideos.map((vid) => vid.split(',')[1]),
      pdfs: uploadedPdfs.map((pdf) => pdf.split(',')[1]),
    };
    console.log(uploadedPdfs);
    try {
      const response = await fetch('http://localhost:8000/api/chat/context', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (response.status === 401 || response.status === 403) {
        console.log("INVALID TOKEN");
        toast({
          title: "Authentication Error",
          description: "Please log in to start a new analysis.",
          variant: "destructive",
        });
        return;
      }
      if (!response.ok) {
        const r = await response.json();
        console.log(r);
        throw new Error('Failed to start new chat');
      }

      const data = await response.json();

      toast({
        title: "Analysis Started",
        description: "Your request has been sent for processing.",
      });
      setMessage('');
      setUploadedImages([]);
      setUploadedVideos([]);
      setUploadedPdfs([]);
      setFileInputKey(Date.now()); // Reset the file input key

      router.push(`/dashboard/${data.id}`);
    } catch (error) {
      console.error('Error starting new chat:', error);
      toast({
        title: "Error",
        description: "Failed to start new analysis. Please try again.",
        variant: "destructive",
      });
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
        } else if (file.type.startsWith('application/pdf')) {
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
              setUploadedPdfs([newPdfs[0]]); // Only allow one PDF to be uploaded
            } else {
              toast({
                title: 'Too many PDFs',
                description: 'You can upload a maximum of 2 PDFs.',
                variant: 'destructive',
              });
            }
          };
          reader.readAsDataURL(file);
          console.log(uploadedPdfs);
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prevImages) => {
      const updatedImages = prevImages.filter((_, i) => i !== index);
      if (updatedImages.length === 0) {
        setFileInputKey(Date.now()); // Reset the file input key
      }
      return updatedImages;
    });
  };

  const removeUploadedVideo = (index: number) => {
    setUploadedVideos((prevVideos) => {
      const updatedVideos = prevVideos.filter((_, i) => i !== index);
      if (updatedVideos.length === 0) {
        setFileInputKey(Date.now()); // Reset the file input key
      }
      return updatedVideos;
    });
  };
  const removeUploadedPdf = (index: number) => {
    setUploadedPdfs((prevPdfs) => {
      const updatedPdfs= prevPdfs.filter((_, i) => i !== index);
      if(prevPdfs.length === 0){
        setFileInputKey(Date.now());
      }
      return updatedPdfs;
    });
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleNewChat();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        <div onMouseLeave={handleMouseLeave}>
          <Sidebar isVisible={showSidebar} />
        </div>
      </motion.div>
      <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 shadow-lg rounded-b-3xl">
  <div className="flex items-center gap-4">
    <div
      className="relative z-50 cursor-pointer transition-all duration-300 ease-in-out hover:scale-105"
      onMouseEnter={handleMouseEnter}
    >
      <motion.h1
        className="text-3xl font-bold text-white tracking-tight"
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <Link href="/">SHAKTI AI</Link>
      </motion.h1>
    </div>
    <div className="ml-10 text-sm text-green-600 bg-green-50 dark:bg-green-900 dark:text-green-300 px-4 py-1 rounded-full inline-block shadow-md">
      All Detection Models Active
    </div>
  </div>

  <div className="flex items-center gap-6">
    <motion.div
      whileHover={{ rotate: 10 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="cursor-pointer text-white"
    >
      <UserMenu
        name={userData?.name || 'Guest'}
        email={userData?.email || 'Not logged in'}
        position={userData?.position || 'N/A'}
      />
    </motion.div>

    {/* Add Social Media or Settings Menu */}
    <div className="flex items-center gap-4">
      <motion.div
        whileHover={{ scale: 1.2, rotate: 15 }}
        transition={{ duration: 0.2 }}
        className="text-white cursor-pointer"
      >
        {/* Example of adding a fun icon with hover animation */}
        <Link href="/settings">
          <VideoIcon className="w-6 h-6" />
        </Link>
      </motion.div>
    </div>
  </div>
</header>


        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
           <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700 dark:text-indigo-300 font-electrolize" style={{ fontFamily: 'Alerta, sans-serif' }}>
  {userData && (
    <div>
      How may I assist you today, {userData.position} {userData.name}?
    </div>
  )}
  {!userData && (
    <div>
      Please login to start a new analysis.
    </div>
  )}
</h2>

            <Card className="bg-white dark:bg-zinc-800 shadow-xl rounded-xl overflow-hidden">
              <CardContent className="p-4">
                {(uploadedImages.length > 0 || uploadedVideos.length > 0 || uploadedPdfs.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {uploadedImages.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-24 h-24 border rounded-md overflow-hidden cursor-pointer"
                        onClick={() => openMediaViewer(image, 'image')}
                      >
                        <Image
                          src={image}
                          alt={`Uploaded image ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 w-6 h-6 p-1 bg-white rounded-full flex items-center justify-center"
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
                        className="relative w-24 h-24 border rounded-md overflow-hidden cursor-pointer"
                        onClick={() => openMediaViewer(video, 'video')}
                      >
                       <video
                  className="w-full h-full object-cover"
                  src={video}
                  title={`Uploaded video ${index + 1}`} // You can use the title attribute here
                  controls
                />

                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 w-6 h-6 p-1 bg-white rounded-full flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeUploadedVideo(index);
                          }}
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
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
{selectedMedia && selectedMediaType && (
  <MediaModal
                    mediaSrc={typeof selectedMedia === 'string' ? selectedMedia : ''} // Correct the prop name to 'mediaSrc'
                    mediaType={selectedMediaType}
                    onClose={closeMediaViewer} isOpen={false}  />
)}


                <Textarea
                  ref={textareaRef}
                  placeholder="Enter a new message here"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="mb-4"
                />
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={triggerFileInput}>
                    <ImagePlus className="h-5 w-5 text-indigo-500" />
                    <input
                      key={fileInputKey}
                      type="file"
                      accept="image/*,video/*, application/pdf"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple
                    />
                  </Button>
                  <Button
                    onClick={handleNewChat}
                    className="ml-auto"
                    disabled={!message.trim() && uploadedImages.length === 0 && uploadedVideos.length === 0}
                  >
                    <Send className="w-4 h-4" />
                    Start Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
        </div>
        <motion.footer 
          className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:to-purple-900 shadow-lg rounded-t-3xl"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Add some cool footer content */}
          <motion.div 
            className="text-white text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            © 2023 SHAKTI AI. All rights reserved.
          </motion.div>
          <motion.div 
            className="flex space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.a 
              href="#" 
              className="text-white hover:text-indigo-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Terms
            </motion.a>
            <motion.a 
              href="#" 
              className="text-white hover:text-indigo-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Privacy
            </motion.a>
            <motion.a 
              href="#" 
              className="text-white hover:text-indigo-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Security
            </motion.a>
          </motion.div>
        </motion.footer>

      </div>
      
    </div>
  );
}
