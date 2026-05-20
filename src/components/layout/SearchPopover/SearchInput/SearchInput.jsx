import { Input } from "antd";
import { RiSearchLine } from "react-icons/ri";
export const SearchInput = () => {
  return (
    <div className="search-box rounded-full shadow-[0px_5px_10px_rgba(0,0,0,0.09)]">
      <Input
        prefix={<RiSearchLine />}
        className="search-box"
        allowClear
        placeholder="Search Messages..."
      />
    </div>
  );
};
