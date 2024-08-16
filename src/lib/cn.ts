import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

//
// Properly merge tailwind classes (even conflicting ones)
//
// https://www.youtube.com/watch?v=tfgLd5ZSNPc
// https://www.youtube.com/watch?v=re2JFITR7TI
//

export default function cn(...args: ClassValue[]) {
  return twMerge(clsx(args))
}
