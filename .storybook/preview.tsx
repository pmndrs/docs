import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'
import { Mcu } from 'react-mcu'

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
      <Mcu source="#6750A4" scheme="tonalSpot">
        <div className="p-8">
          <Story />
        </div>
      </Mcu>
    ),
  ],
}

export default preview
