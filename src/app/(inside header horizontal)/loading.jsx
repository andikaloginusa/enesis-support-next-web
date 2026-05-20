import loaderPic from "@public/loader.svg";
import Image from "next/image";
export default function Loading() {
  return (
    <div className="loader">
      <Image src={loaderPic} alt="wieldy-loader" />
    </div>
  );
}
