import type { Meta, StoryObj } from '@storybook/react'
import { Code } from '../Code'

const meta = {
  title: 'MDX Components/Code',
  component: Code,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Code>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <code className="language-javascript">
        {`function hello() {
  console.log("Hello, world!");
}`}
      </code>
    ),
  },
}

export const TypeScript: Story = {
  args: {
    children: (
      <code className="language-typescript">
        {`interface User {
  name: string;
  age: number;
}

const user: User = {
  name: "John Doe",
  age: 30
};`}
      </code>
    ),
  },
}

export const JSX: Story = {
  args: {
    children: (
      <code className="language-jsx">
        {`import React from 'react';

export function Button({ label, onClick }) {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  );
}`}
      </code>
    ),
  },
}

export const MultiLine: Story = {
  args: {
    children: (
      <code className="language-bash">
        {`# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build`}
      </code>
    ),
  },
}
