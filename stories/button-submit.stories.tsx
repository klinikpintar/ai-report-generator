import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import ButtonSubmit from './button-submit';

// More on how to set up stories: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Components/ButtonSubmit',
  component: ButtonSubmit,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['primary', 'secondary'],
    },
    type: {
      control: 'text',
    },
    className: {
      control: 'text',
    },
  },
  args: {
    onClick: fn(), // Spy on clicks
  },
} satisfies Meta<typeof ButtonSubmit>;

export default meta;
type Story = StoryObj<typeof meta>;

// Simpan button
export const Simpan: Story = {
  args: {
    children: 'Simpan',
    variant: 'primary',
    type: 'submit',
  },
};

// Batal button
export const Batal: Story = {
  args: {
    children: 'Batal',
    variant: 'secondary',
    type: 'button',
  },
};

// Dengan custom class tambahan
export const CustomClass: Story = {
  args: {
    children: 'Custom',
    variant: 'primary',
    className: 'mt-4 shadow-lg',
  },
};