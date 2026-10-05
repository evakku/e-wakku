/**
 * E-Wakku Typography Components
 * ─────────────────────────────────────────────────────────────────────
 * Polymorphic, composable React components that map to the E-Wakku
 * editorial type scale. Each component:
 *  - Applies the correct CSS utility class from globals.css
 *  - Accepts an `as` prop to render any HTML element
 *  - Forwards `className` for Tailwind composition
 *  - Forwards all other props to the underlying element
 *
 * Usage:
 *   <DisplayXL as="h1">Premium Editorial</DisplayXL>
 *   <HeadlineLg>Issue 12</HeadlineLg>
 *   <LabelCaps className="text-accent">Category</LabelCaps>
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

// ─── Polymorphic helper types ─────────────────────────────────────────────────

type AsProp<E extends React.ElementType> = {
  as?: E
}

type PolymorphicProps<E extends React.ElementType, P = object> = P &
  AsProp<E> &
  Omit<React.ComponentPropsWithoutRef<E>, keyof (P & AsProp<E>)>

// ─── Display XL ──────────────────────────────────────────────────────────────
/**
 * Display XL — Hero titles, magazine covers
 * Noto Serif · 64px · Weight 400 · lh 1.1 · ls -0.02em
 * Default element: <h1>
 */
export function DisplayXL<E extends React.ElementType = 'h1'>({
  as,
  className,
  ...props
}: PolymorphicProps<E>) {
  const Tag = (as ?? 'h1') as React.ElementType
  return (
    <Tag
      className={cn('type-display-xl', className)}
      {...props}
    />
  )
}

// ─── Headline Large ───────────────────────────────────────────────────────────
/**
 * Headline Large — Section & article headings
 * Noto Serif · 48px · Weight 400 · lh 1.2
 * Default element: <h2>
 */
export function HeadlineLg<E extends React.ElementType = 'h2'>({
  as,
  className,
  ...props
}: PolymorphicProps<E>) {
  const Tag = (as ?? 'h2') as React.ElementType
  return (
    <Tag
      className={cn('type-headline-lg', className)}
      {...props}
    />
  )
}

// ─── Headline Medium ──────────────────────────────────────────────────────────
/**
 * Headline Medium — Card & component headings
 * Noto Serif · 32px · Weight 400 · lh 1.3
 * Default element: <h3>
 */
export function HeadlineMd<E extends React.ElementType = 'h3'>({
  as,
  className,
  ...props
}: PolymorphicProps<E>) {
  const Tag = (as ?? 'h3') as React.ElementType
  return (
    <Tag
      className={cn('type-headline-md', className)}
      {...props}
    />
  )
}

// ─── Subheadline ──────────────────────────────────────────────────────────────
/**
 * Subheadline — Lead text, UI emphasis, captions
 * Inter · 20px · Weight 500 · lh 1.5
 * Default element: <p>
 */
export function Subheadline<E extends React.ElementType = 'p'>({
  as,
  className,
  ...props
}: PolymorphicProps<E>) {
  const Tag = (as ?? 'p') as React.ElementType
  return (
    <Tag
      className={cn('type-subheadline', className)}
      {...props}
    />
  )
}

// ─── Body Large ───────────────────────────────────────────────────────────────
/**
 * Body Large — Long-form editorial copy
 * Inter · 18px · Weight 400 · lh 1.7
 * Default element: <p>
 */
export function BodyLg<E extends React.ElementType = 'p'>({
  as,
  className,
  ...props
}: PolymorphicProps<E>) {
  const Tag = (as ?? 'p') as React.ElementType
  return (
    <Tag
      className={cn('type-body-lg', className)}
      {...props}
    />
  )
}

// ─── Body Medium ──────────────────────────────────────────────────────────────
/**
 * Body Medium — Default UI text
 * Inter · 16px · Weight 400 · lh 1.6
 * Default element: <p>
 */
export function BodyMd<E extends React.ElementType = 'p'>({
  as,
  className,
  ...props
}: PolymorphicProps<E>) {
  const Tag = (as ?? 'p') as React.ElementType
  return (
    <Tag
      className={cn('type-body-md', className)}
      {...props}
    />
  )
}

// ─── Label Caps ───────────────────────────────────────────────────────────────
/**
 * Label Caps — Metadata, categories, form labels, UI tags
 * Inter · 12px · Weight 600 · Uppercase · ls 0.1em
 * Default element: <span>
 */
export function LabelCaps<E extends React.ElementType = 'span'>({
  as,
  className,
  ...props
}: PolymorphicProps<E>) {
  const Tag = (as ?? 'span') as React.ElementType
  return (
    <Tag
      className={cn('type-label-caps', className)}
      {...props}
    />
  )
}

// ─── Named exports for tree-shaking ──────────────────────────────────────────

export const Typography = {
  DisplayXL,
  HeadlineLg,
  HeadlineMd,
  Subheadline,
  BodyLg,
  BodyMd,
  LabelCaps,
} as const
