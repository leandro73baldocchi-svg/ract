import React from 'react';
import { RactVideo } from '../types';

interface VideoCardProps {
  video: RactVideo;
}

export default function VideoCard({ video }: VideoCardProps) {
  
  // Função atualizada para identificar de onde vem o vídeo
  const identificarVideo = (url: string) => {
    if (!url) return null;
    
    // 1. Tenta achar YouTube
    const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const ytMatch = url.match(ytRegExp);
    if (ytMatch && ytMatch[2].length === 11) {
      return { tipo: 'youtube', linkRender: `https://www.youtube.com/embed/${ytMatch[2]}` };
    }

    // 2. Tenta achar Vimeo
    const vimeoRegExp = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/;
    const vimeoMatch = url.match(vimeoRegExp);
    if (vimeoMatch && vimeoMatch[1]) {
      return { tipo: 'vimeo', linkRender: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
    }

    // 3. Verifica se é um arquivo de vídeo direto (termina em .mp4 ou .webm)
    if (url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.webm')) {
      return { tipo: 'direto', linkRender: url };
    }

    // Se não for nenhum dos 3
    return null;
  };

  const infoVideo = identificarVideo(video.url);

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff', marginBottom: '20px' }}>
      
      {/* Área do Player */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, backgroundColor: '#000' }}>
        {infoVideo?.tipo === 'youtube' || infoVideo?.tipo === 'vimeo' ? (
          <iframe 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            src={infoVideo.linkRender} 
            title={video.title}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen>
          </iframe>
        ) : infoVideo?.tipo === 'direto' ? (
          <video 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            controls 
            src={infoVideo.linkRender}
            title={video.title}>
            Seu navegador não suporta a reprodução deste vídeo.
          </video>
        ) : (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              Formato de vídeo não suportado.<br/>
              <span style={{ fontSize: '12px' }}>Use YouTube, Vimeo ou link direto .mp4</span>
            </p>
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
