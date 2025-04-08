import React, { useState, useEffect } from 'react';

interface RosaVientosEstrellasProps {
    width?: number;
    height?: number;
}

const RosaVientosEstrellas: React.FC<RosaVientosEstrellasProps> = ({ 
    width = 200, 
    height = 200 
}) => {
    const posiciones = {
        center: { x: 0, y: 0 },
        N: { x: 0, y: -1 },
        NE: { x: 0.7, y: -0.7 },
        E: { x: 1, y: 0 },
        SE: { x: 0.7, y: 0.7 },
        S: { x: 0, y: 1 },
        SW: { x: -0.7, y: 0.7 },
        W: { x: -1, y: 0 },
        NW: { x: -0.7, y: -0.7 }
    };

    const [posicionActual, setPosicionActual] = useState(posiciones.center);
    const [animacionActiva, setAnimacionActiva] = useState(false);

    useEffect(() => {
        const handleDirectionChange = (event) => {
            const newDirection = event.detail.direction;
            setPosicionActual(posiciones[newDirection]);
            setAnimacionActiva(true);
            setTimeout(() => setAnimacionActiva(false), 300);
        };

        window.addEventListener('changeDirection', handleDirectionChange);

        return () => {
            window.removeEventListener('changeDirection', handleDirectionChange);
        };
    }, []);

    const radio = 100;
    const puntoX = 150 + posicionActual.x * radio;
    const puntoY = 150 + posicionActual.y * radio;

    const crearEstrella = (puntas, radioInterno, radioExterno, rotacion = 0) => {
        let puntos = "";
        const angulo = (2 * Math.PI) / puntas;
        
        for (let i = 0; i < puntas; i++) {
            const xExterno = 150 + radioExterno * Math.sin(i * angulo + rotacion);
            const yExterno = 150 - radioExterno * Math.cos(i * angulo + rotacion);
            puntos += `${xExterno},${yExterno} `;
            
            const xInterno = 150 + radioInterno * Math.sin((i + 0.5) * angulo + rotacion);
            const yInterno = 150 - radioInterno * Math.cos((i + 0.5) * angulo + rotacion);
            puntos += `${xInterno},${yInterno} `;
        }
        
        return puntos.trim();
    };

    const estrella1 = crearEstrella(4, 20, 120, 0);
    const estrella2 = crearEstrella(4, 20, 100, Math.PI / 4);

    return (
        <div className="flex flex-col items-center justify-center" style={{backgroundColor: '#2b2b2b8f', width: `${width}px`, height: `${height}px`, borderRadius: '800px' }}>   
            <div className="relative w-full h-80 bg-gradient-to-r from-blue-700 to-indigo-800 border-2 border-indigo-500 rounded-lg shadow-inner overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-blue-500 rounded-full blur-xl transform translate-x-10 translate-y-10"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-indigo-500 rounded-full blur-xl transform -translate-x-10 -translate-y-10"></div>
                </div>
                
                <svg viewBox="0 0 300 300" className="absolute top-0 left-0 w-full h-full">
                    <circle cx="150" cy="150" r="130" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                    <polygon points={estrella1} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" className={animacionActiva ? "animate-pulse" : ""} />
                    <polygon points={estrella2} fill="none" stroke="rgba(173,216,230,0.7)" strokeWidth="1.5" className={animacionActiva ? "animate-pulse" : ""} />
                    <circle cx="150" cy="150" r="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                    <circle cx="150" cy="150" r="5" fill="white" />
                    <g className="text-white">
                        <text x="150" y="25" textAnchor="middle" fill="white" fontWeight="bold" fontSize="18">N</text>
                        <text x="150" y="285" textAnchor="middle" fill="white" fontWeight="bold" fontSize="18">S</text>
                        <text x="285" y="155" textAnchor="middle" fill="white" fontWeight="bold" fontSize="18">E</text>
                        <text x="15" y="155" textAnchor="middle" fill="white" fontWeight="bold" fontSize="18">O</text>
                    </g>
                    <g className="text-blue-200">
                        <text x="240" y="60" textAnchor="middle" fill="rgba(173,216,230,0.9)" fontWeight="bold" fontSize="14">NE</text>
                        <text x="240" y="240" textAnchor="middle" fill="rgba(173,216,230,0.9)" fontWeight="bold" fontSize="14">SE</text>
                        <text x="60" y="240" textAnchor="middle" fill="rgba(173,216,230,0.9)" fontWeight="bold" fontSize="14">SO</text>
                        <text x="60" y="60" textAnchor="middle" fill="rgba(173,216,230,0.9)" fontWeight="bold" fontSize="14">NO</text>
                    </g>
                    <circle cx={puntoX} cy={puntoY} r="20" fill="rgba(255,0,0,0.2)" className="animate-pulse" />
                    <circle cx={puntoX} cy={puntoY} r="10" fill="rgba(255,60,60,0.8)" stroke="white" strokeWidth="2" />
                    <circle cx={puntoX} cy={puntoY} r="4" fill="white" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 opacity-10"></div>
                </div>
            </div>
        </div>
    );
};

export default RosaVientosEstrellas;