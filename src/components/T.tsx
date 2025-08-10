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
      setTranslatedText(children);
      return;
    }

    let isCancelled = false;
    
    // Set a placeholder while translating
    setTranslatedText('...');

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
  }, [children, language]);

  return <>{translatedText}</>;
}

export const T = memo(TComponent);
