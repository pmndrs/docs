import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'
import { McuProvider } from 'react-mcu'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    (Story) => (
      <McuProvider>
        <div className="p-8">
          <Story />
        </div>
      </McuProvider>
    ),
  ],
}

export default preview
