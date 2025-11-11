import React, { ReactNode } from 'react';

// Permite que quaisquer atributos de div padrão sejam passados
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

// Desestrutura children e className, e coleta o resto dos props em `...props`
const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    // Espalha os props coletados no elemento div
    <div className={`bg-white dark:bg-slate-800/80 rounded-xl shadow-md dark:shadow-xl dark:shadow-black/20 p-4 sm:p-6 transition-all hover:shadow-lg dark:hover:shadow-2xl dark:hover:shadow-black/30 border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
