'use client';

import { useState, useEffect, memo } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { translateText } from '@/ai/flows/translate-text';

interface TProps {
  children: string;
}

function TComponent({ children }: TProps) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState('');

  useEffect(() => {
    if (language === 'en' || !children) {
      setTranslatedText(children);
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
  }, [children, language]);

  // On the server and on the initial client render, render the original children.
  // After hydration, the useEffect hook will run and update the state with the translation.
  if (translatedText === '') {
    return <>{children}</>;
  }

  return <>{translatedText}</>;
}

export const T = memo(TComponent);
