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
    <div className={`bg-white rounded-xl shadow-md p-4 sm:p-6 transition-shadow hover:shadow-lg ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
