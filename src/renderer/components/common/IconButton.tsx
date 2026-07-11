import React from 'react'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string
  title?: string
  variant?: 'default' | 'danger'
  size?: 'sm' | 'md'
}

export function IconButton({
  icon,
  title,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: IconButtonProps): React.ReactElement {
  return (
    <button
      className={`icon-btn icon-btn-${variant} icon-btn-${size} ${className}`}
      title={title}
      {...props}
    >
      {icon}
    </button>
  )
}
