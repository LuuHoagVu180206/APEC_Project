import React from 'react';

/**
 * Hình minh họa Đồ họa Đẳng cự (Isometric Vector Artwork)
 * Thiết kế chuẩn Positivus: Viền đen rõ nét, màu sắc hòa hợp hoàn hảo với màu nền của Card (Xanh dương hoặc Trắng).
 */

export const IsometricSpaceLineArt = ({ variant }) => {
    const isBlue = variant === 'blue';
    const border = '#191a23';
    
    // Màu sắc tương ứng với nền card
    const planetFill = isBlue ? '#ffffff' : '#e0f2fe';
    const planetBand = isBlue ? '#bae6fd' : '#7dd3fc';
    const rocketHead = isBlue ? '#ffffff' : '#7dd3fc';
    const rocketBody = isBlue ? '#e0f2fe' : '#ffffff';
    const rocketFin = isBlue ? '#0284c7' : '#0369a1';
    const ringStroke = isBlue ? 'rgba(255, 255, 255, 0.9)' : '#38bdf8';
    const gridStroke = isBlue ? 'rgba(255, 255, 255, 0.45)' : '#cbd5e1';
    const starFill = isBlue ? '#ffffff' : '#0284c7';
    const starSubtle = isBlue ? 'rgba(255, 255, 255, 0.7)' : '#38bdf8';

    return (
        <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="bento-illustration-svg">
            {/* Isometric grid floor */}
            <path d="M15 70 L80 32 L145 70 L80 108 Z" stroke={gridStroke} strokeWidth="1.4" strokeDasharray="3 3" />
            <path d="M80 108 L80 132" stroke={gridStroke} strokeWidth="1.4" strokeDasharray="3 3" />

            {/* Orbit ellipse */}
            <ellipse cx="80" cy="65" rx="56" ry="24" stroke={ringStroke} strokeWidth="2.2" transform="rotate(-15 80 65)" strokeDasharray="5 3" />

            {/* Central Planet Sphere */}
            <circle cx="80" cy="65" r="26" stroke={border} strokeWidth="2" fill={planetFill} />
            <path d="M56 60 Q80 76 104 60" stroke={planetBand} strokeWidth="2" fill="none" />
            <path d="M60 72 Q80 86 100 72" stroke={isBlue ? '#0284c7' : '#38bdf8'} strokeWidth="1.8" fill="none" />

            {/* Isometric Rocket Flying */}
            <g transform="translate(106, 18) rotate(25)">
                <path d="M14 0 L22 17 L6 17 Z" stroke={border} strokeWidth="1.8" fill={rocketHead} />
                <rect x="9" y="17" width="10" height="15" rx="2" stroke={border} strokeWidth="1.8" fill={rocketBody} />
                <path d="M9 22 L3 30 L9 28" stroke={border} strokeWidth="1.6" fill={rocketFin} strokeLinecap="round" />
                <path d="M19 22 L25 30 L19 28" stroke={border} strokeWidth="1.6" fill={rocketFin} strokeLinecap="round" />
                <circle cx="14" cy="23" r="2.5" stroke={border} strokeWidth="1.2" fill={isBlue ? '#38bdf8' : '#0284c7'} />
                <path d="M11 32 L14 41 L17 32" stroke={border} strokeWidth="1.6" fill={isBlue ? '#ffffff' : '#f59e0b'} strokeLinecap="round" />
            </g>

            {/* Starlight accents */}
            <path d="M30 38 L32 30 L34 38 L42 40 L34 42 L32 50 L30 42 L22 40 Z" stroke={border} strokeWidth="1.2" fill={starFill} />
            <path d="M136 88 L137 83 L138 88 L143 89 L138 90 L137 95 L136 90 L131 89 Z" stroke={border} strokeWidth="1" fill={starSubtle} />
            <circle cx="28" cy="85" r="2.5" fill={border} />
            <circle cx="138" cy="48" r="2" fill={starFill} />
        </svg>
    );
};

export const IsometricOceanLineArt = ({ variant }) => {
    const isBlue = variant === 'blue';
    const border = '#191a23';

    // Màu sắc tương ứng với nền card
    const subHull = isBlue ? '#ffffff' : '#e0f2fe';
    const subTower = isBlue ? '#e0f2fe' : '#7dd3fc';
    const waveAccent = isBlue ? 'rgba(255, 255, 255, 0.85)' : '#38bdf8';
    const waveSubtle = isBlue ? 'rgba(255, 255, 255, 0.5)' : '#cbd5e1';
    const bubbleFill = isBlue ? '#ffffff' : '#bae6fd';
    const detailAccent = isBlue ? '#0284c7' : '#0369a1';

    return (
        <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="bento-illustration-svg">
            {/* Wave depth contour lines */}
            <path d="M15 85 Q45 70 80 85 T145 85" stroke={waveSubtle} strokeWidth="1.5" strokeDasharray="4 3" />
            <path d="M15 102 Q50 88 85 102 T150 102" stroke={waveAccent} strokeWidth="2" />
            <path d="M20 118 Q55 105 90 118 T145 118" stroke={waveSubtle} strokeWidth="1.4" />

            {/* Isometric Submarine */}
            <g transform="translate(40, 28)">
                <ellipse cx="45" cy="35" rx="34" ry="18" stroke={border} strokeWidth="2" fill={subHull} />
                <rect x="36" y="10" width="16" height="12" rx="3" stroke={border} strokeWidth="2" fill={subTower} />
                <path d="M44 10 L44 2 L50 2" stroke={border} strokeWidth="2" strokeLinecap="round" />
                
                {/* Viewports */}
                <circle cx="32" cy="35" r="4.5" stroke={border} strokeWidth="1.6" fill={isBlue ? '#38bdf8' : detailAccent} />
                <circle cx="48" cy="35" r="4.5" stroke={border} strokeWidth="1.6" fill={isBlue ? '#38bdf8' : detailAccent} />
                <circle cx="64" cy="35" r="4.5" stroke={border} strokeWidth="1.6" fill={isBlue ? '#38bdf8' : detailAccent} />
                
                {/* Tail Propeller */}
                <path d="M11 35 L0 26 L4 35 L0 44 Z" stroke={border} strokeWidth="1.6" fill={subTower} />
                <line x1="79" y1="35" x2="85" y2="35" stroke={border} strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Sonar ripples */}
            <path d="M125 50 A 20 20 0 0 1 145 70" stroke={waveAccent} strokeWidth="1.8" strokeLinecap="round" strokeDasharray="3 3" />
            <path d="M132 45 A 30 30 0 0 1 155 75" stroke={waveSubtle} strokeWidth="1.4" strokeLinecap="round" />
            
            {/* Marine bubbles */}
            <circle cx="32" cy="40" r="3.5" stroke={border} strokeWidth="1.2" fill={bubbleFill} />
            <circle cx="26" cy="28" r="2.5" stroke={border} strokeWidth="1.2" fill={bubbleFill} />
            <circle cx="40" cy="20" r="2" stroke={border} strokeWidth="1" fill={bubbleFill} />
        </svg>
    );
};

export const IsometricAILineArt = ({ variant }) => {
    const isBlue = variant === 'blue';
    const border = '#191a23';

    // Màu sắc tương ứng với nền card
    const cpuTop = isBlue ? '#ffffff' : '#e0f2fe';
    const cpuLeft = isBlue ? '#bae6fd' : '#7dd3fc';
    const cpuRight = isBlue ? '#7dd3fc' : '#38bdf8';
    const busAccent = isBlue ? 'rgba(255, 255, 255, 0.9)' : '#0284c7';
    const busSubtle = isBlue ? 'rgba(255, 255, 255, 0.45)' : '#cbd5e1';
    const nodeFill = isBlue ? '#0284c7' : '#0369a1';

    return (
        <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="bento-illustration-svg">
            {/* Isometric Circuit Platform */}
            <path d="M15 65 L80 25 L145 65 L80 105 Z" stroke={busSubtle} strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
            
            {/* Logic Bus Lines */}
            <path d="M35 53 L20 44 L20 30" stroke={busAccent} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="20" cy="30" r="2.8" stroke={border} strokeWidth="1.2" fill={nodeFill} />
            
            <path d="M125 53 L140 44 L140 32" stroke={busAccent} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="140" cy="32" r="2.8" stroke={border} strokeWidth="1.2" fill={nodeFill} />
            
            <path d="M80 105 L80 125" stroke={border} strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="80" cy="125" r="2.5" fill={border} />

            <path d="M50 86 L30 98" stroke={busSubtle} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="30" cy="98" r="2" fill={busSubtle} />

            <path d="M110 86 L130 98" stroke={busAccent} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="130" cy="98" r="2" fill={nodeFill} />

            {/* 3D Isometric CPU Core */}
            <g transform="translate(0, 5)">
                <path d="M80 40 L108 56 L80 72 L52 56 Z" stroke={border} strokeWidth="2" fill={cpuTop} />
                <path d="M52 56 L80 72 L80 84 L52 68 Z" stroke={border} strokeWidth="2" fill={cpuLeft} />
                <path d="M80 72 L108 56 L108 68 L80 84 Z" stroke={border} strokeWidth="2" fill={cpuRight} />
                
                {/* Neural core center */}
                <circle cx="80" cy="56" r="6.5" stroke={border} strokeWidth="1.6" fill={nodeFill} />
                <circle cx="80" cy="56" r="2.8" fill="#ffffff" />
                <line x1="72" y1="56" x2="63" y2="51" stroke={busSubtle} strokeWidth="1.4" />
                <line x1="88" y1="56" x2="97" y2="51" stroke={busSubtle} strokeWidth="1.4" />
                <line x1="80" y1="50" x2="80" y2="44" stroke={busAccent} strokeWidth="1.4" />
            </g>

            {/* Floating Isometric Data Cubes */}
            <g transform="translate(62, 10)">
                <path d="M18 0 L26 5 L18 10 L10 5 Z" stroke={border} strokeWidth="1.5" fill={cpuTop} />
                <path d="M10 5 L18 10 L18 16 L10 11 Z" stroke={border} strokeWidth="1.5" fill={cpuLeft} />
                <path d="M18 10 L26 5 L26 11 L18 16 Z" stroke={border} strokeWidth="1.5" fill={cpuRight} />
            </g>
        </svg>
    );
};

export const IsometricTrophyLineArt = ({ variant }) => {
    const isBlue = variant === 'blue';
    const border = '#191a23';

    // Màu sắc tương ứng với nền card
    const podiumTop = isBlue ? '#ffffff' : '#e0f2fe';
    const podiumLeft = isBlue ? '#bae6fd' : '#7dd3fc';
    const podiumRight = isBlue ? '#7dd3fc' : '#38bdf8';
    const cupFill = isBlue ? '#ffffff' : '#f0f9ff';
    const cupStem = isBlue ? '#0284c7' : '#7dd3fc';
    const starBadge = isBlue ? '#0369a1' : '#0284c7';
    const starAccent = isBlue ? '#ffffff' : '#38bdf8';

    return (
        <svg viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="bento-illustration-svg">
            {/* Isometric Podium Block */}
            <path d="M80 82 L120 102 L80 122 L40 102 Z" stroke={border} strokeWidth="2" fill={podiumTop} />
            <path d="M40 102 L80 122 L80 132 L40 112 Z" stroke={border} strokeWidth="2" fill={podiumLeft} />
            <path d="M80 122 L120 102 L120 112 L80 132 Z" stroke={border} strokeWidth="2" fill={podiumRight} />

            {/* Stem & Trophy Cup */}
            <rect x="76" y="65" width="8" height="20" stroke={border} strokeWidth="1.8" fill={cupStem} />
            <path d="M60 30 L100 30 L94 65 L66 65 Z" stroke={border} strokeWidth="2" fill={cupFill} />
            
            {/* Handles */}
            <path d="M60 36 C48 36 48 54 64 56" stroke={border} strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M100 36 C112 36 112 54 96 56" stroke={border} strokeWidth="2" strokeLinecap="round" fill="none" />

            {/* Star badge on Cup */}
            <path d="M80 40 L82 46 L88 47 L83 51 L85 57 L80 53 L75 57 L77 51 L72 47 L78 46 Z" stroke={border} strokeWidth="1" fill={starBadge} />

            {/* Accents */}
            <path d="M30 40 L32 32 L34 40 L42 42 L34 44 L32 52 L30 44 L22 42 Z" stroke={border} strokeWidth="1.2" fill={starAccent} />
            <path d="M130 35 L131 30 L132 35 L137 36 L132 37 L131 42 L130 37 L125 36 Z" stroke={border} strokeWidth="1" fill={isBlue ? 'rgba(255, 255, 255, 0.7)' : '#cbd5e1'} />
            <circle cx="128" cy="75" r="2.5" fill={border} />
            <circle cx="35" cy="80" r="2.5" fill={starAccent} />
        </svg>
    );
};

export const getBentoIllustration = (topic, index, variant) => {
    const t = (topic || '').toLowerCase();
    if (t.includes('vũ trụ') || t.includes('thiên văn') || t.includes('không gian') || t.includes('space') || index === 0) {
        return <IsometricSpaceLineArt variant={variant} />;
    }
    if (t.includes('đại dương') || t.includes('sinh thái') || t.includes('biển') || t.includes('ocean') || index === 1) {
        return <IsometricOceanLineArt variant={variant} />;
    }
    if (t.includes('trí tuệ') || t.includes('ai') || t.includes('công nghệ') || t.includes('tech') || index === 2) {
        return <IsometricAILineArt variant={variant} />;
    }
    return <IsometricTrophyLineArt variant={variant} />;
};
