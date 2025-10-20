import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface ModalContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalCount, setModalCount] = useState(0);

  const openModal = () => setModalCount(prev => prev + 1);
  const closeModal = () => setModalCount(prev => Math.max(0, prev - 1));

  const isModalOpen = modalCount > 0;

  return (
    <ModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

// Hook to automatically notify context when a modal opens/closes
export function useModalState(isOpen: boolean) {
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    if (isOpen) {
      openModal();
      return () => closeModal();
    }
  }, [isOpen, openModal, closeModal]);
}
