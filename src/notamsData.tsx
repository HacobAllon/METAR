// NotamsData.tsx
import React from 'react';

export const localNotams = [
  {
    id: 1,
    icao: 'RPLL',
    message: 'Changes to SIDS and STARS - AIRAC2511',
    start: '2025-10-30 0400Z',
    end: '2025-11-27 0400Z',
  },
  {
    id: 2,
    icao: 'VATPHIL',
    message: 'AIRAC2510 is released https://vats.im/ph/2510',
    start: '2025-10-02 0400Z',
    end: '2025-10-30 0400Z',
  },
];

// Define props type
type NotamMessageProps = {
  message: string;
};

// Helper component to display NOTAM messages with clickable URLs
export const NotamMessage: React.FC<NotamMessageProps> = ({ message }) => {
  const urlMatch = message.match(/https?:\/\/\S+/);
  const url = urlMatch ? urlMatch[0] : null;
  const messageText = url ? message.replace(url, '').trim() : message;

  return (
    <>
      {messageText}{' '}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'lightblue', textDecoration: 'underline' }}
        >
          {url}
        </a>
      )}
    </>
  );
};
