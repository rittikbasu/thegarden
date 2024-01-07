import { Circles } from "svg-loaders-react";
import { IoSearchOutline, IoRefresh } from "react-icons/io5";

const SearchButton = ({
  streaming,
  disabled,
  handleSearch,
  searchResult,
  searchInput = false,
}) => {
  console.log("searchInput", searchInput);

  const handleClick = () => {
    if (searchResult !== "") {
      handleSearch({ regenerate: true });
    } else {
      handleSearch({ regenerate: false });
    }
  };

  const icon = streaming ? (
    <>
      <Circles className="w-4 h-4 mr-2" />
      generating
    </>
  ) : searchResult === "" || searchInput ? (
    <>
      <IoSearchOutline className="w-4 h-4 mr-1" />
      search
    </>
  ) : (
    <>
      <IoRefresh className="w-4 h-4 mr-1" />
      regenerate
    </>
  );

  return (
    <button
      className="py-0.5 px-2 rounded-lg bg-blue-600 shadow-inner shadow-black/50 flex items-center justify-center"
      onClick={handleClick}
      disabled={disabled}
    >
      {icon}
    </button>
  );
};

export default SearchButton;
