import React, { useState, useEffect, useCallback } from 'react';
import { Quote } from '../types';
import { getQuotes, createQuote, updateQuote, deleteQuote } from '../services/api';

type QuoteType = 'binary' | 'multiple-choice';

const MC_WRONG_COUNT = 3;

interface QuoteFormState {
  type: QuoteType;
  text: string;
  author: string;
  wrongOptions: string[];
}

const emptyForm = (): QuoteFormState => ({
  type: 'multiple-choice',
  text: '',
  author: '',
  wrongOptions: Array(MC_WRONG_COUNT).fill(''),
});

const inferType = (wrongOptions: string[]): QuoteType =>
  wrongOptions.length >= 2 ? 'multiple-choice' : 'binary';

const QuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [form, setForm] = useState<QuoteFormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuotes();
      setQuotes(data);
    } catch {
      setError('Failed to load quotes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const openCreate = () => {
    setEditingQuote(null);
    setForm(emptyForm());
    setModalError(null);
    setShowModal(true);
  };

  const openEdit = (quote: Quote) => {
    setEditingQuote(quote);
    const type = inferType(quote.wrongOptions);
    let wrongOptions: string[];
    if (type === 'multiple-choice') {
      wrongOptions = [...quote.wrongOptions];
      while (wrongOptions.length < MC_WRONG_COUNT) wrongOptions.push('');
      wrongOptions = wrongOptions.slice(0, MC_WRONG_COUNT);
    } else {
      wrongOptions = [quote.wrongOptions[0] ?? ''];
    }
    setForm({ type, text: quote.text, author: quote.author, wrongOptions });
    setModalError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalError(null);
  };

  const handleTypeChange = (newType: QuoteType) => {
    setForm((prev) => {
      if (newType === 'binary') {
        return { ...prev, type: newType, wrongOptions: [prev.wrongOptions[0] ?? ''] };
      } else {
        const opts = [...prev.wrongOptions];
        while (opts.length < MC_WRONG_COUNT) opts.push('');
        return { ...prev, type: newType, wrongOptions: opts.slice(0, MC_WRONG_COUNT) };
      }
    });
  };

  const setWrongOption = (index: number, value: string) => {
    setForm((prev) => {
      const updated = [...prev.wrongOptions];
      updated[index] = value;
      return { ...prev, wrongOptions: updated };
    });
  };

  const handleSave = async () => {
    const text = form.text.trim();
    const author = form.author.trim();

    if (!text) { setModalError('Quote text cannot be empty.'); return; }
    if (!author) { setModalError('Author cannot be empty.'); return; }

    if (form.type === 'multiple-choice') {
      const filled = form.wrongOptions.filter((o) => o.trim());
      if (filled.length < MC_WRONG_COUNT) {
        setModalError(`All ${MC_WRONG_COUNT} wrong options are required for multiple-choice mode.`);
        return;
      }
    }

    const wrongOptions = form.wrongOptions.map((o) => o.trim()).filter(Boolean);

    setSaving(true);
    setModalError(null);
    try {
      if (editingQuote) {
        await updateQuote(editingQuote.id, text, author, wrongOptions);
      } else {
        await createQuote(text, author, wrongOptions);
      }
      closeModal();
      await fetchQuotes();
    } catch {
      setModalError('Failed to save quote. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (confirmDeleteId === null) return;
    setDeleting(true);
    try {
      await deleteQuote(confirmDeleteId);
      setConfirmDeleteId(null);
      await fetchQuotes();
    } catch {
      setError('Failed to delete quote.');
    } finally {
      setDeleting(false);
    }
  };

  const truncate = (str: string, max = 80) =>
    str.length > max ? str.slice(0, max) + '…' : str;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold mb-0">Quote Management</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          + Add Quote
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
            <span className="visually-hidden">Loading…</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Quote</th>
                <th>Author</th>
                <th>Type</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">
                    No quotes found.
                  </td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id}>
                    <td className="text-muted">{quote.id}</td>
                    <td style={{ maxWidth: '320px' }}>
                      <span className="fst-italic">"{truncate(quote.text)}"</span>
                    </td>
                    <td className="fw-semibold text-nowrap">{quote.author}</td>
                    <td>
                      {inferType(quote.wrongOptions) === 'multiple-choice' ? (
                        <span className="badge bg-info text-dark">Multiple Choice</span>
                      ) : (
                        <span className="badge bg-secondary">Binary</span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => openEdit(quote)}
                          title="Edit quote"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => setConfirmDeleteId(quote.id)}
                          title="Delete quote"
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
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingQuote ? 'Edit Quote' : 'Add Quote'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal} aria-label="Close" />
                </div>
                <div className="modal-body">
                  {modalError && (
                    <div className="alert alert-danger py-2" role="alert">
                      {modalError}
                    </div>
                  )}

                  {/* Type selector */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold d-block">Quote Type</label>
                    <div className="btn-group w-100" role="group" aria-label="Quote type">
                      <input
                        type="radio"
                        className="btn-check"
                        name="quoteType"
                        id="typeBinary"
                        checked={form.type === 'binary'}
                        onChange={() => handleTypeChange('binary')}
                      />
                      <label className="btn btn-outline-secondary" htmlFor="typeBinary">
                        <strong>Binary</strong>
                        <span className="d-block small fw-normal text-muted">Yes / No — was this said by the author?</span>
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="quoteType"
                        id="typeMultipleChoice"
                        checked={form.type === 'multiple-choice'}
                        onChange={() => handleTypeChange('multiple-choice')}
                      />
                      <label className="btn btn-outline-info" htmlFor="typeMultipleChoice">
                        <strong>Multiple Choice</strong>
                        <span className="d-block small fw-normal text-muted">Pick the correct author from 4 options</span>
                      </label>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="quoteText" className="form-label fw-semibold">
                      Quote Text
                    </label>
                    <textarea
                      id="quoteText"
                      className="form-control"
                      rows={3}
                      value={form.text}
                      onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
                      autoFocus
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="quoteAuthor" className="form-label fw-semibold">
                      Correct Author
                      <span className="text-muted fw-normal ms-1">
                        {form.type === 'binary' ? '— the answer is Yes for this author' : ''}
                      </span>
                    </label>
                    <input
                      id="quoteAuthor"
                      type="text"
                      className="form-control"
                      value={form.author}
                      onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                    />
                  </div>

                  {form.type === 'binary' ? (
                    <div className="mb-2">
                      <label htmlFor="binaryDecoy" className="form-label fw-semibold">
                        Decoy Author{' '}
                        <span className="text-muted fw-normal">(shown when the answer is No — optional)</span>
                      </label>
                      <input
                        id="binaryDecoy"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Albert Einstein"
                        value={form.wrongOptions[0] ?? ''}
                        onChange={(e) => setWrongOption(0, e.target.value)}
                      />
                      <div className="form-text">
                        If left empty, this quote will only appear as a "Yes" question in binary mode.
                      </div>
                    </div>
                  ) : (
                    <fieldset className="mb-2">
                      <legend className="form-label fw-semibold fs-6">
                        Wrong Options{' '}
                        <span className="text-muted fw-normal">(all 3 required)</span>
                      </legend>
                      {form.wrongOptions.map((opt, i) => (
                        <div className="mb-2" key={i}>
                          <input
                            type="text"
                            className="form-control"
                            placeholder={`Wrong option ${i + 1}`}
                            value={opt}
                            onChange={(e) => setWrongOption(i, e.target.value)}
                          />
                        </div>
                      ))}
                    </fieldset>
                  )}
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
                  <h5 className="modal-title">Delete Quote</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setConfirmDeleteId(null)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body">
                  Are you sure you want to permanently delete this quote?
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

export default QuotesPage;
