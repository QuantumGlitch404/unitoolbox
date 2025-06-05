
"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Loader2, ShieldAlert } from 'lucide-react';

interface AdblockDetectorProps {
  children: React.ReactNode;
}

export function AdblockDetector({ children }: AdblockDetectorProps) {
  const [adblockerDetected, setAdblockerDetected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const baitRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const bait = document.createElement('div');
    // Common class names targeted by adblockers
    bait.className = 'ad-container ad-slot banner-ad google-ad text-ad ad-banner sponsorship';
    bait.style.position = 'absolute';
    bait.style.left = '-9999px'; // Move it off-screen
    bait.style.width = '1px';
    bait.style.height = '1px';
    bait.style.opacity = '0.01'; // Make it minimally visible if not blocked
    bait.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bait);
    baitRef.current = bait;

    const checkAdblocker = () => {
      if (baitRef.current) {
        if (
          baitRef.current.offsetHeight === 0 ||
          getComputedStyle(baitRef.current).display === 'none' ||
          getComputedStyle(baitRef.current).visibility === 'hidden' ||
          getComputedStyle(baitRef.current).opacity === '0' // Some blockers might set opacity to 0
        ) {
          setAdblockerDetected(true);
        }
      }
      setIsChecking(false);
      // Clean up the bait element
      if (baitRef.current && baitRef.current.parentNode) {
        baitRef.current.parentNode.removeChild(baitRef.current);
        baitRef.current = null;
      }
    };

    // Check after a short delay to give adblockers time to act
    // requestAnimationFrame is often blocked by adblockers, so setTimeout is more reliable here
    const checkTimeout = setTimeout(checkAdblocker, 750);


    return () => {
      clearTimeout(checkTimeout);
      if (baitRef.current && baitRef.current.parentNode) {
        baitRef.current.parentNode.removeChild(baitRef.current);
        baitRef.current = null;
      }
    };
  }, []);

  if (isChecking) {
    // Full screen loader to prevent content flash
    return (
      <div className="fixed inset-0 bg-background z-[9999] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (adblockerDetected) {
    return (
      <AlertDialog open={true}> {/* Controlled open state, non-dismissible by default AlertDialog action/cancel */}
        <AlertDialogContent className="max-w-lg w-[95%] sm:w-full">
          <AlertDialogHeader className="text-center items-center">
            <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
            <AlertDialogTitle className="text-2xl lg:text-3xl font-headline">Ad Blocker Detected</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center text-base md:text-lg space-y-4 py-2">
            <div>
              We&apos;ve noticed you&apos;re using an ad blocker. UniToolBox relies on advertisements to keep our comprehensive suite of tools free for everyone.
            </div>
            <div>
              To continue using our website, we kindly ask you to
              <strong className="text-foreground"> disable your ad blocker for unitoolbox.vercel.app</strong>.
            </div>
            <div>
              Don&apos;t worry, our ads are selected to be as unobtrusive as possible.
              After disabling, please <strong className="text-foreground">refresh this page</strong> to access the tools.
            </div>
            <div className="mt-3 font-semibold">
              Thank you for your understanding and support!
            </div>
          </AlertDialogDescription>
          {/* No actions are provided to ensure the dialog is persistent */}
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return <>{children}</>; // No adblocker detected, render the app content
}
