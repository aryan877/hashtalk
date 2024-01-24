'use client'

import React from 'react';
import { useParams } from 'next/navigation';

function ChatPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  return <div>id: {id}</div>;
}

export default ChatPage;
