import { useWieldyTheme } from "@wieldy/components/WieldyTheme/hooks";
import { Button } from "antd";
import { useCallback, useState } from "react";
import { MdDarkMode, MdOutlineLightMode } from "react-icons/md";

const ThemeModeOptions = () => {
  const [isMode, setIsMode] = useState(true); // Initialize as null to indicate it's not ready
  const { switchMode } = useWieldyTheme();

  const handleModeChange = useCallback(
    (mode) => {
      if (mode === "light") {
        switchMode("light");
        setIsMode(true);
      } else {
        switchMode("dark");
        setIsMode(false);
      }
    },
    [switchMode]
  );

  return (
    <Button
      type="text"
      shape="circle"
      className="[&_.ant-btn-icon]:inline-flex"
      icon={
        isMode ? (
          <MdOutlineLightMode
            onClick={() => handleModeChange("dark")}
            className="text-xl"
          />
        ) : (
          <MdDarkMode
            onClick={() => handleModeChange("light")}
            className="text-xl"
          />
        )
      }
    />
  );
};

export { ThemeModeOptions };
