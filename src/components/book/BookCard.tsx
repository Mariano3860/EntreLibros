import { BookCardProps } from '@components/book/BookCard.types'
import React from 'react'

import styles from './BookCard.module.scss'

export const BookCard: React.FC<BookCardProps> = ({
  title,
  author,
  coverUrl,
}) => {
  return (
    <div className={styles.card}>
      <img src={coverUrl} alt={title} className={styles.cover} />
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.author}>{author}</p>
      </div>
    </div>
  )
}
