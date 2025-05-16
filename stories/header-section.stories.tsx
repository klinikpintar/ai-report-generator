import type { Meta, StoryObj } from '@storybook/react';
import { HeaderSection } from './header-section';

const meta = {
  title: 'Components/HeaderSection',
  component: HeaderSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof HeaderSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Left: Story = {
  args: {
    title: 'Manajemen Skema Database',
    subtitle: 'Kelola dan Atur Skema Database dengan Fleksibel',
    description:
      'Mengelompokkan skema ke dalam service yang sesuai, memastikan validasi skema, serta melakukan perubahan jika diperlukan untuk memastikan integritas data.',
    align: 'left',
  },
};

export const Center: Story = {
  args: {
    title: 'Manajemen Service Klinik Pintar',
    subtitle: 'Atur Service untuk AI Report Generator',
    description:
      'Pastikan chatbot dapat menggunakan service yang sesuai untuk menyesuaikan hasil laporan yang akurat dan relevan.',
    align: 'center',
  },
};
