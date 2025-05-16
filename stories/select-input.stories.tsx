import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import SelectInput from './select-input';

const meta = {
  title: 'Components/SelectInput',
  component: SelectInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof SelectInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Platform: Story = {
  args: {
    label: 'Platform',
    name: 'platform',
    value: '',
    options: [
      { value: 'PostgreSQL', label: 'PostgreSQL' },
      { value: 'MySQL', label: 'MySQL' },
      { value: 'MongoDB', label: 'MongoDB' },
    ],
  },
};

export const Service: Story = {
  args: {
    label: 'Service',
    name: 'service',
    value: '',
    options: [
      { value: 'Reservasi', label: 'Reservasi' },
      { value: 'Kesehatan', label: 'Kesehatan' },
      { value: 'Keuangan', label: 'Keuangan' },
      { value: 'Inventaris', label: 'Inventaris' },
    ],
  },
};