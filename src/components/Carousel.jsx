import { useState, useEffect } from "react";
import Image from "next/image";

import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { IoClose } from "react-icons/io5";

const Carousel = ({ isOpen, images, onClose, selectedImageIndex }) => {
  const [currentIndex, setCurrentIndex] = useState(selectedImageIndex);

  useEffect(() => {
    setCurrentIndex(selectedImageIndex);
  }, [selectedImageIndex]);

  if (!isOpen || !images.length) return null;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="fixed max-w-lg transform -translate-x-1/2 top-0 left-1/2 px-4 w-full h-full flex items-center justify-center bg-black backdrop-blur-md bg-opacity-40 z-50">
      <div className="bg-zinc-900/20 p-4 rounded-lg border border-zinc-800/70">
        <Image
          src={images[currentIndex]}
          alt={`image-${currentIndex + 1}`}
          width={500}
          height={500}
          className="object-contain rounded"
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-evenly">
          <button
            onClick={handlePrev}
            className="border border-zinc-700 bg-zinc-800/50 text-zinc-300 p-3 rounded-full"
          >
            <IoIosArrowBack />
          </button>
          <button
            onClick={onClose}
            className="border border-red-500 text-red-500 p-3 rounded-full"
          >
            <IoClose />
          </button>
          <button
            onClick={handleNext}
            className="border border-zinc-700 bg-zinc-800/50 text-zinc-300 p-3 rounded-full"
          >
            <IoIosArrowForward />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
