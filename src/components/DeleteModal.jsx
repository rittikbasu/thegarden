const DeleteModal = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full p-10 flex items-center justify-center bg-black backdrop-blur-sm bg-opacity-40">
      <div className="bg-zinc-900 p-4 space-y-8 rounded-lg border border-zinc-800/40">
        <p>Are you sure you want to delete this note?</p>
        <button
          onClick={onDelete}
          className="border border-red-500 text-red-500 px-4 py-1 rounded-lg"
        >
          delete
        </button>
        <button
          onClick={onClose}
          className="border border-gray-600 text-gray-400 px-4 py-1 rounded-lg ml-6"
          disabled={false}
        >
          cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteModal;
