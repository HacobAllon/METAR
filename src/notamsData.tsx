// NotamsData.tsx
import React from 'react';

export const localNotams = [
  {
    id: 1,
    icao: 'RPLL',
    message:
      '',
    start: '',
    end: '',
  },
  {
    id: 2,
    icao: 'VATPHIL',
    message: 'AIRAC2511 is released https://vats.im/ph/2511',
    start: '2025-11-03 0400Z',
    end: '2025-11-28 0400Z',
  },
  {
    id: 1,
    icao: 'RPVM',
    message:
      'SUN-FRI 1930-0930 TWY G1 AND A4 CLOSED DUE WORK IN PROGRESS',
    start: '2025-11-2 1930Z',
    end: '2025-11-22 0930Z',
  },
   {
    id: 2,
    icao: 'RPVM',
    message:
      '1830-1930 RAPID EXIT TAXIWAY R1 CLOSED DUE WORK IN PROGRESS',
    start: '2025-10-28 0635Z',
    end: '2026-1-27 1930Z',
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
