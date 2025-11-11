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
    <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-md dark:shadow-slate-900/50 p-4 sm:p-6 transition-all hover:shadow-lg dark:hover:shadow-slate-900/70 border border-slate-100 dark:border-slate-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
