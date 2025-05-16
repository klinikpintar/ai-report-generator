import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import FormInput from "./form-input";

const meta = {
  title: "Components/FormInput",
  component: FormInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof FormInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    label: "Nama Label",
    name: "nama_label",
    type: "text",
    value: "",
    placeholder: "Masukkan nama label",
  },
};

export const Textarea: Story = {
  args: {
    label: "Deskripsi Label",
    name: "deskripsi_label",
    type: "textarea",
    value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sapien ornare vitae amet.",
    placeholder: "Tulis deskripsi di sini...",
  },
};

export const WithError: Story = {
  args: {
    label: "Nama Label",
    name: "nama_label",
    type: "text",
    value: "",
    error: "Nama label tidak boleh kosong",
  },
};