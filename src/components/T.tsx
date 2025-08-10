'use client';

import { useState, useEffect, memo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { translateText } from '@/ai/flows/translate-text';

interface TProps {
  children: string;
}

function TComponent({ children }: TProps) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(children);

  useEffect(() => {
    if (language === 'en' || !children) {
      if (translatedText !== children) {
        setTranslatedText(children);
      }
      return;
    }

    let isCancelled = false;

    translateText({ text: children, targetLanguage: language })
      .then(result => {
        if (!isCancelled) {
          setTranslatedText(result.translatedText);
        }
      })
      .catch(error => {
        console.error('Translation error:', error);
        if (!isCancelled) {
          setTranslatedText(children); // Fallback to original text on error
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [children, language, translatedText]);

  if (language !== 'en' && translatedText === children) {
    // While translating, render nothing on the client to avoid mismatch.
    // The initial server-render will show the original text.
    // The client will then show nothing, and then the translated text.
    // This is better than showing "..." which causes a mismatch.
    return null;
  }
  
  return <>{translatedText}</>;
}

export const T = memo(TComponent);
