// __test__/frontend/admin/manage-user/sections/UserTableSection.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserTableSection } from '@frontend/admin/manage-user/sections/userTableSection';
import { UserTableProvider } from '@frontend/admin/manage-user/context/UserTableContext';
import React from 'react';

jest.mock('@frontend/admin/manage-user/components/FilterByRoleDropdown', () => ({
  FilterByRoleDropdown: () => <div>Mocked FilterByRoleDropdown</div>,
}));

jest.mock('@frontend/admin/manage-user/components/UserTable', () => ({
  UserTable: ({ onEditUser, onDeleteUser }: any) => (
    <div>
      <button onClick={() => onEditUser({ id: '1', name: 'Test', email: 'test@example.com', isActive: true, role: 'ADMIN' })}>
        Mock Edit Button
      </button>
      <button onClick={() => onDeleteUser({ id: '1', name: 'Test', email: 'test@example.com', isActive: true, role: 'ADMIN' })}>
        Mock Delete Button
      </button>
    </div>
  ),
}));

jest.mock('@frontend/admin/manage-user/components/addAccountModal', () => ({
  __esModule: true,
  default: ({ isVisible }: any) => (isVisible ? <div>AddAccountModal Open</div> : null),
}));

jest.mock('@frontend/admin/manage-user/components/editAccountModal', () => ({
  __esModule: true,
  default: ({ isVisible }: any) => (isVisible ? <div>EditAccountModal Open</div> : null),
}));

jest.mock('@frontend/components/ConfirmationDialog', () => ({
  ConfirmationDialog: ({ isOpen, onClose, onConfirm }: any) =>
    isOpen ? (
      <div>
        <div>ConfirmationDialog Open</div>
        <button onClick={onConfirm}>Confirm Delete</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));


jest.mock('@frontend/admin/manage-user/hooks/useUserAction', () => ({
  useUserActions: () => ({
    handleDeleteUser: jest.fn().mockResolvedValue(true),
  }),
}));

describe('UserTableSection', () => {
  it('renders filter and add user button', () => {
    render(
      <UserTableProvider>
        <UserTableSection />
      </UserTableProvider>
    );
    expect(screen.getByText('Mocked FilterByRoleDropdown')).toBeInTheDocument();
    expect(screen.getByText('Tambah Pengguna')).toBeInTheDocument();
  });

  it('initially renders modals as closed', () => {
    render(
      <UserTableProvider>
        <UserTableSection />
      </UserTableProvider>
    );
    expect(screen.queryByText('AddAccountModal Open')).not.toBeInTheDocument();
    expect(screen.queryByText('EditAccountModal Open')).not.toBeInTheDocument();
    expect(screen.queryByText('ConfirmationDialog Open')).not.toBeInTheDocument();
  });

  it('opens AddAccountModal when Tambah Pengguna clicked', () => {
    render(
      <UserTableProvider>
        <UserTableSection />
      </UserTableProvider>
    );
    fireEvent.click(screen.getByText('Tambah Pengguna'));
    expect(screen.getByText('AddAccountModal Open')).toBeInTheDocument();
  });

  it('opens EditAccountModal when edit button clicked', () => {
    render(
      <UserTableProvider>
        <UserTableSection />
      </UserTableProvider>
    );
    fireEvent.click(screen.getByText('Mock Edit Button'));
    expect(screen.getByText('EditAccountModal Open')).toBeInTheDocument();
  });

  it('closes ConfirmationDialog when cancel is clicked', async () => {
    render(
      <UserTableProvider>
        <UserTableSection />
      </UserTableProvider>
    );
  
    fireEvent.click(screen.getByText('Mock Delete Button'));
    fireEvent.click(screen.getByText('Cancel'));
  
    await waitFor(() => {
      expect(screen.queryByText('ConfirmationDialog Open')).not.toBeInTheDocument();
    });
  });
  
  

  it('calls confirm delete and closes ConfirmationDialog', async () => {
    render(
      <UserTableProvider>
        <UserTableSection />
      </UserTableProvider>
    );
    
    fireEvent.click(screen.getByText('Mock Delete Button'));

    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Confirm Delete'));
  
    await waitFor(() => {
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    });
  });
  

  it('closes ConfirmationDialog when cancel is clicked', () => {
    render(
      <UserTableProvider>
        <UserTableSection />
      </UserTableProvider>
    );
    fireEvent.click(screen.getByText('Mock Delete Button'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('ConfirmationDialog Open')).not.toBeInTheDocument();
  });
});
