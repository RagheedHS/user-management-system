import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './ModalContainer.css';

const MODAL_ROOT_ID = 'modal-root';

const ModalContainer = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  // ensure a modal root exists in the document
  useEffect(() => {
    let root = document.getElementById(MODAL_ROOT_ID);
    if (!root) {
      root = document.createElement('div');
      root.id = MODAL_ROOT_ID;
      document.body.appendChild(root);
    }
  }, []);

  const root = document.getElementById(MODAL_ROOT_ID);
  if (!root) return null;

  return ReactDOM.createPortal(
    <div className="og-modal-backdrop" onClick={onClose} role="presentation">
      <div className="og-modal-wrapper" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    root
  );
};

export default ModalContainer;
