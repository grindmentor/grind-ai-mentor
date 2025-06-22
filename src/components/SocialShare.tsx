
import { Button } from "@/components/ui/button";
import { Share2, Twitter, Facebook, Instagram, Link2 } from "lucide-react";
import { useState } from "react";

interface SocialShareProps {
  title: string;
  description: string;
  url?: string;
}

const SocialShare = ({ title, description, url = window.location.href }: SocialShareProps) => {
  const [copied, setCopied] = useState(false);

  const shareData = {
    title,
    text: description,
    url
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled');
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link');
    }
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    instagram: 'https://www.instagram.com/' // Instagram doesn't support direct URL sharing
  };

  return (
    <div className="flex items-center space-x-2">
      {navigator.share && (
        <Button
          onClick={handleNativeShare}
          size="sm"
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      )}
      
      <Button
        onClick={() => window.open(shareUrls.twitter, '_blank')}
        size="sm"
        variant="outline"
        className="border-gray-700 text-gray-300 hover:bg-gray-800"
      >
        <Twitter className="w-4 h-4" />
      </Button>
      
      <Button
        onClick={() => window.open(shareUrls.facebook, '_blank')}
        size="sm"
        variant="outline"
        className="border-gray-700 text-gray-300 hover:bg-gray-800"
      >
        <Facebook className="w-4 h-4" />
      </Button>
      
      <Button
        onClick={handleCopyLink}
        size="sm"
        variant="outline"
        className="border-gray-700 text-gray-300 hover:bg-gray-800"
      >
        <Link2 className="w-4 h-4 mr-1" />
        {copied ? 'Copied!' : 'Copy'}
      </Button>
    </div>
  );
};

export default SocialShare;
