import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="confirm-dialog-body">
        {isDanger && (
          <div className="confirm-dialog-warning-icon" aria-hidden="true">
            <AlertTriangle size={24} />
          </div>
        )}
        <p className="confirm-dialog-message">{message}</p>

        <div className="form-actions">
          <button
            type="button"
            className="button button-ghost"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`button ${isDanger ? 'button-danger' : 'button-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
