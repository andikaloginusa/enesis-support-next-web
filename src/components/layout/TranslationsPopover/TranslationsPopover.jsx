import { Button, Dropdown } from "antd";
import ReactCountryFlag from "react-country-flag";
import { useApp } from "@hooks";

export const TranslationsPopover = () => {
  const { locale, changeLanguage } = useApp();

  const supportedLngs = {
    "en-US": { name: "English", flag: "GB" },
    "ar-SA": { name: "Arabic (العربية)", flag: "SA" },
    "fr-FR": { name: "French", flag: "FR" },
    "zh-CN": { name: "Chinese", flag: "CN" },
    "es-ES": { name: "Spanish", flag: "ES" },
    "it-IT": { name: "Italian", flag: "IT" },
  };

  const currentLanguageCode = locale || "en-US";
  const currentFlag = supportedLngs[currentLanguageCode]?.flag || "GB";

  const handleLanguageChange = (language) => {
    if (changeLanguage) {
      changeLanguage(language);
    }
  };

  const menu = {
    items: Object.entries(supportedLngs).map(([code, { name, flag }]) => ({
      key: code,
      label: (
        <span
          onClick={() => handleLanguageChange(code)}
          className="flex items-center"
        >
          <ReactCountryFlag countryCode={flag} svg className="w-6 h-4 mr-2" />
          {name}
        </span>
      ),
    })),
  };

  return (
    <Dropdown menu={menu} trigger={["click"]} placement={"bottom"}>
      <Button
        type="text"
        shape="circle"
        className="[&_.ant-btn-icon]:inline-flex"
        icon={
          <ReactCountryFlag countryCode={currentFlag} svg className="text-xl" />
        }
      />
    </Dropdown>
  );
};
