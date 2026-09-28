import React from 'react';
import { RactVideo } from '../types';

// Avisamos ao componente que ele receberá os dados no formato RactVideo
interface VideoCardProps {
  video: RactVideo;
}

export default function VideoCard({ video }: VideoCardProps) {
  // Essa função garante que o iframe funcione quer você cole o link como 
  // youtube.com/watch?v=123 ou youtu.be/123
  const extrairIdDoYouTube = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = extrairIdDoYouTube(video.url);

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff', marginBottom: '20px' }}>
      
      {/* Área do Player (Proporção 16:9 perfeita para YouTube) */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
        {videoId ? (
          <iframe 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            src={`https://www.youtube.com/embed/${videoId}`} 
            title={video.title}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen>
          </iframe>
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
            <p style={{ color: '#6b7280' }}>Link de vídeo inválido</p>
          </div>
        )}
      </div>

      {/* Área de Textos */}
      <div style={{ padding: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' }}>
          {video.category}
        </span>
        <h3 style={{ margin: '8px 0', fontSize: '18px', color: '#111827', fontWeight: '600' }}>
          {video.title}
        </h3>
        <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px', lineHeight: '1.5' }}>
          {video.description}
        </p>
        <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
          <span>Fonte: {video.channelName}</span>
          <span>{new Date(video.dateAdded).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

    </div>
  );
}
