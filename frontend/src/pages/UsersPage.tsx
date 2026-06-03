import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { getUsers, createUser, updateUser, disableUser, enableUser, deleteUser, setUserAdmin } from '../services/api';
import { useGame } from '../context/GameContext';

type ModalMode = 'create' | 'edit';

const UsersPage: React.FC = () => {
  const { userId: currentUserId, refreshCurrentUser } = useGame();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setModalMode('create');
    setEditingUser(null);
    setUsernameInput('');
    setModalError(null);
    setShowModal(true);
  };

  const openEdit = (user: User) => {
    setModalMode('edit');
    setEditingUser(user);
    setUsernameInput(user.username);
    setModalError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalError(null);
  };

  const handleSave = async () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      setModalError('Username cannot be empty.');
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      if (modalMode === 'create') {
        await createUser(trimmed);
      } else if (editingUser) {
        await updateUser(editingUser.id, trimmed);
      }
      closeModal();
      await fetchUsers();
    } catch {
      setModalError('Failed to save user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      if (user.isActive) {
        await disableUser(user.id);
      } else {
        await enableUser(user.id);
      }
      await fetchUsers();
    } catch {
      setError('Failed to update user status.');
    }
  };

  const handleToggleAdmin = async (user: User) => {
    try {
      await setUserAdmin(user.id, !user.isAdmin);
      await fetchUsers();
      if (user.id === currentUserId) await refreshCurrentUser();
    } catch {
      setError('Failed to update admin status.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId === null) return;
    setDeleting(true);
    try {
      await deleteUser(confirmDeleteId);
      setConfirmDeleteId(null);
      await fetchUsers();
    } catch {
      setError('Failed to delete user.');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold mb-0">User Management</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Create User
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} aria-label="Close" />
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Created</th>
                <th className="text-center">Status</th>
                <th className="text-center">Role</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="text-muted">{user.id}</td>
                    <td className="fw-semibold">{user.username}</td>
                    <td className="text-nowrap">{formatDate(user.createdAt)}</td>
                    <td className="text-center">
                      <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {user.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${user.isAdmin ? 'bg-primary' : 'bg-light text-dark border'}`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => openEdit(user)}
                          title="Edit username"
                        >
                          Edit
                        </button>
                        <button
                          className={`btn ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                          onClick={() => handleToggleActive(user)}
                          title={user.isActive ? 'Disable user' : 'Enable user'}
                        >
                          {user.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          className={`btn ${user.isAdmin ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                          onClick={() => handleToggleAdmin(user)}
                          title={user.isAdmin ? 'Remove admin' : 'Make admin'}
                        >
                          {user.isAdmin ? 'Demote' : 'Promote'}
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => setConfirmDeleteId(user.id)}
                          title="Delete user"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{modalMode === 'create' ? 'Create User' : 'Edit User'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal} aria-label="Close" />
                </div>
                <div className="modal-body">
                  {modalError && (
                    <div className="alert alert-danger py-2" role="alert">
                      {modalError}
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="usernameInput" className="form-label fw-semibold">
                      Username
                    </label>
                    <input
                      id="usernameInput"
                      type="text"
                      className="form-control"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId !== null && (
        <>
          <div className="modal-backdrop fade show" />
          <div className="modal d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-sm" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Delete User</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setConfirmDeleteId(null)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  Are you sure you want to permanently delete this user?
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteConfirm}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UsersPage;
